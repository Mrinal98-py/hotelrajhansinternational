import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { calculateNights } from "@/lib/utils";
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
    const { newCheckOut, additionalNightsCount } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!booking) {
      return apiError("NOT_FOUND", "Booking not found", 404);
    }

    if (booking.status !== "CHECKED_IN" && booking.status !== "CONFIRMED") {
      return apiError(
        "CONFLICT",
        `Cannot extend stay for booking with status ${booking.status}. Only CONFIRMED or CHECKED_IN bookings can be extended.`,
        400
      );
    }

    const previousCheckOut = new Date(booking.checkOut);
    let targetCheckOut: Date;

    if (newCheckOut) {
      targetCheckOut = new Date(newCheckOut);
    } else if (additionalNightsCount) {
      targetCheckOut = new Date(previousCheckOut);
      targetCheckOut.setDate(targetCheckOut.getDate() + parseInt(additionalNightsCount, 10));
    } else {
      return apiError("VALIDATION_ERROR", "newCheckOut date or additionalNightsCount is required.", 400);
    }

    if (targetCheckOut <= previousCheckOut) {
      return apiError(
        "VALIDATION_ERROR",
        "New check-out date must be after current check-out date.",
        400
      );
    }

    const additionalNights = calculateNights(previousCheckOut, targetCheckOut);

    // Check if the assigned room is already assigned to another stay during the extended window
    if (booking.assignedRoomId) {
      const conflict = await prisma.roomAssignment.findFirst({
        where: {
          physicalRoomId: booking.assignedRoomId,
          bookingId: { not: booking.id },
          status: { in: ["ASSIGNED", "ACTIVE"] },
          booking: {
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
            AND: [
              { checkIn: { lt: targetCheckOut } },
              { checkOut: { gt: previousCheckOut } },
            ],
          },
        },
      });

      if (conflict) {
        return apiError(
          "CONFLICT",
          "Cannot extend in the same physical room: It is reserved for an incoming guest. Please assign a different room or change dates.",
          409
        );
      }
    }

    // Calculate additional rate
    const nightlyRate = booking.appliedRoomRate || booking.room.basePriceDouble;
    const additionalAmount = Math.round(nightlyRate * additionalNights * 100) / 100;
    const taxRate = booking.appliedTaxRate || booking.room.taxPercentage || 12;
    const taxAmount = Math.round(((additionalAmount * taxRate) / 100) * 100) / 100;
    const netAdditional = Math.round((additionalAmount + taxAmount) * 100) / 100;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Record StayExtension
      const extension = await tx.stayExtension.create({
        data: {
          bookingId: booking.id,
          previousCheckOut,
          newCheckOut: targetCheckOut,
          additionalNights,
          additionalAmount,
          taxAmount,
          createdBy: currentStaff.name,
        },
      });

      // 2. Post charge to Folio
      const folio = await getOrCreateFolio(booking.id, tx);
      await addFolioItem(
        {
          folioId: folio.id,
          itemType: FolioItemType.ROOM_CHARGE,
          description: `Stay Extension: +${additionalNights} night(s) to ${targetCheckOut.toISOString().split("T")[0]}`,
          quantity: additionalNights,
          unitPrice: nightlyRate,
          amount: additionalAmount,
          taxRate,
          taxAmount,
          postedBy: currentStaff.name,
          referenceId: extension.id,
        },
        tx
      );

      // 3. Update Booking
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          checkOut: targetCheckOut,
          totalAmount: { increment: additionalAmount },
          taxAmount: { increment: taxAmount },
        },
        include: { folio: { include: { items: true } } },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "STAY_EXTENSION",
          entity: "Booking",
          entityId: booking.id,
          details: `Extended booking ${booking.referenceId} by ${additionalNights} nights. New checkout: ${targetCheckOut.toISOString()}`,
        },
      });

      return { extension, updatedBooking };
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");

    return apiSuccess({
      message: `Stay successfully extended by ${additionalNights} nights until ${targetCheckOut.toLocaleDateString("en-IN")}.`,
      extension: result.extension,
      booking: result.updatedBooking,
      additionalAmount: netAdditional,
    });
  } catch (error: any) {
    console.error("Stay Extension Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to extend stay", 500);
  }
}
