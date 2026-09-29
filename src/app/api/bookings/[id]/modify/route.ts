import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { getAvailablePhysicalRooms } from "@/lib/inventory";
import { calculateBookingPricing } from "@/lib/pricing";
import { addFolioItem, getOrCreateFolio } from "@/lib/folio";
import { FolioItemType } from "@prisma/client";

export const revalidate = 0;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const {
      checkIn,
      checkOut,
      roomTypeId,
      physicalRoomId,
      guestsCount,
      adults,
      children,
      extraBeds,
      reason = "Customer modification request",
    } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        room: true,
        roomAssignments: { where: { status: { in: ["ASSIGNED", "ACTIVE"] } } },
      },
    });

    if (!booking) {
      return apiError("NOT_FOUND", "Booking not found", 404);
    }

    if (booking.status === "CANCELLED" || booking.status === "CHECKED_OUT") {
      return apiError("CONFLICT", `Cannot modify booking with status ${booking.status}`, 400);
    }

    const newCheckIn = checkIn ? new Date(checkIn) : new Date(booking.checkIn);
    const newCheckOut = checkOut ? new Date(checkOut) : new Date(booking.checkOut);
    const newRoomTypeId = roomTypeId || booking.roomId;
    const newAdults = adults !== undefined ? parseInt(adults, 10) : booking.adults;
    const newChildren = children !== undefined ? parseInt(children, 10) : booking.children;
    const newExtraBeds = extraBeds !== undefined ? parseInt(extraBeds, 10) : 0;
    const newGuestsCount = guestsCount !== undefined ? parseInt(guestsCount, 10) : booking.guestsCount;

    if (newCheckOut <= newCheckIn) {
      return apiError("VALIDATION_ERROR", "Check-out must be after check-in", 400);
    }

    // 1. Verify Availability
    const availableRooms = await getAvailablePhysicalRooms(
      newRoomTypeId,
      newCheckIn,
      newCheckOut
    );

    // If staying in the same physical room, that room is acceptable even if currently assigned to this booking
    const isStayingSameRoom =
      booking.assignedRoomId && (!physicalRoomId || physicalRoomId === booking.assignedRoomId);

    if (availableRooms.length === 0 && !isStayingSameRoom) {
      return apiError(
        "CONFLICT",
        "No available physical rooms for the new room category or date range.",
        409
      );
    }

    // 2. Recalculate Pricing
    const pricing = await calculateBookingPricing({
      roomTypeId: newRoomTypeId,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      adults: newAdults,
      children: newChildren,
      extraBeds: newExtraBeds,
    });

    const oldNetAmount = booking.netAmount;
    const priceDifference = Math.round((pricing.netAmount - oldNetAmount) * 100) / 100;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Record BookingModification record
      const oldSnapshot = {
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomId: booking.roomId,
        assignedRoomId: booking.assignedRoomId,
        adults: booking.adults,
        children: booking.children,
        totalAmount: booking.totalAmount,
        netAmount: booking.netAmount,
      };

      const newSnapshot = {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        roomId: newRoomTypeId,
        assignedRoomId: physicalRoomId || booking.assignedRoomId,
        adults: newAdults,
        children: newChildren,
        totalAmount: pricing.grossAmount,
        netAmount: pricing.netAmount,
      };

      const modification = await tx.bookingModification.create({
        data: {
          bookingId: booking.id,
          modifiedBy: currentStaff.name,
          reason,
          oldData: oldSnapshot as any,
          newData: newSnapshot as any,
          priceDifference,
        },
      });

      // 2. Adjust Folio
      const folio = await getOrCreateFolio(booking.id, tx);
      if (priceDifference !== 0) {
        await addFolioItem(
          {
            folioId: folio.id,
            itemType: FolioItemType.ADJUSTMENT,
            description: `Booking Modification (${reason}): Rate difference`,
            unitPrice: priceDifference,
            postedBy: currentStaff.name,
            referenceId: modification.id,
          },
          tx
        );
      }

      // 3. Update Physical Room Assignment if changing physical room
      if (physicalRoomId && physicalRoomId !== booking.assignedRoomId) {
        await tx.roomAssignment.updateMany({
          where: { bookingId: booking.id, status: { in: ["ASSIGNED", "ACTIVE"] } },
          data: { status: "TRANSFERRED" },
        });

        await tx.roomAssignment.create({
          data: {
            bookingId: booking.id,
            physicalRoomId,
            assignedBy: currentStaff.name,
            status: booking.status === "CHECKED_IN" ? "ACTIVE" : "ASSIGNED",
            notes: `Transferred via modification (${reason})`,
          },
        });

        if (booking.assignedRoomId) {
          await tx.roomTransfer.create({
            data: {
              bookingId: booking.id,
              fromPhysicalRoomId: booking.assignedRoomId,
              toPhysicalRoomId: physicalRoomId,
              reason: "GUEST_REQUEST",
              notes: `Transferred via modification (${reason})`,
              performedBy: currentStaff.name,
            },
          });
        }
      }

      // 4. Update Booking
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          checkIn: newCheckIn,
          checkOut: newCheckOut,
          roomId: newRoomTypeId,
          assignedRoomId: physicalRoomId || booking.assignedRoomId,
          adults: newAdults,
          children: newChildren,
          guestsCount: newGuestsCount,
          totalAmount: pricing.grossAmount,
          taxAmount: pricing.taxAmount,
          netAmount: pricing.netAmount,
          appliedRoomRate: pricing.ratePerNight,
          appliedTaxRate: pricing.taxPercentage,
          pricingBreakdown: pricing.nightlyBreakdown as any,
        },
        include: {
          customer: true,
          room: true,
          folio: { include: { items: true } },
          roomAssignments: { include: { physicalRoom: true } },
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "BOOKING_MODIFIED",
          entity: "Booking",
          entityId: booking.id,
          details: `Modified booking ${booking.referenceId}. Price difference: ₹${priceDifference}. Reason: ${reason}`,
        },
      });

      return { modification, updatedBooking, priceDifference };
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");

    return apiSuccess({
      message: "Booking successfully modified",
      priceDifference: result.priceDifference,
      booking: result.updatedBooking,
      modification: result.modification,
    });
  } catch (error: any) {
    console.error("Booking Modification Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to modify booking", 500);
  }
}
