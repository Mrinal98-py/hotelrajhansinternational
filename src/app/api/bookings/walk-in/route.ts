import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { generateSafeBookingReference } from "@/lib/sequence";
import { calculateBookingPricing } from "@/lib/pricing";
import { getOrCreateFolio, addFolioItem } from "@/lib/folio";
import { transitionBookingStatus } from "@/lib/booking-state";
import { AssignmentStatus, BookingStatus, FolioItemType, PaymentMethod, PaymentStatus, RoomStatus } from "@prisma/client";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const {
      name,
      phone,
      email,
      address,
      idProofType,
      idProofNumber,
      physicalRoomId,
      checkIn,
      checkOut,
      guestsCount = 2,
      adults = 2,
      children = 0,
      extraBeds = 0,
      paymentMethod = "CASH",
      paidAmount = 0,
      paymentReferenceNote,
      autoCheckIn = false,
      specialRequests,
    } = body;

    if (!name || !phone || !physicalRoomId || !checkIn || !checkOut) {
      return apiError(
        "VALIDATION_ERROR",
        "Name, phone, physicalRoomId, checkIn, and checkOut are required.",
        400
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return apiError("VALIDATION_ERROR", "Check-out date must be after check-in date.", 400);
    }

    // 1. Verify target physical room exists and is ready
    const physicalRoom = await prisma.physicalRoom.findUnique({
      where: { id: physicalRoomId },
      include: { roomType: true },
    });

    if (!physicalRoom) {
      return apiError("NOT_FOUND", "Physical room not found", 404);
    }

    if (
      physicalRoom.status === RoomStatus.OCCUPIED ||
      physicalRoom.status === RoomStatus.MAINTENANCE ||
      physicalRoom.status === RoomStatus.OUT_OF_ORDER
    ) {
      return apiError(
        "CONFLICT",
        `Room ${physicalRoom.roomNumber} is currently ${physicalRoom.status} and cannot be assigned.`,
        409
      );
    }

    // 2. Calculate Pricing
    const pricing = await calculateBookingPricing({
      roomTypeId: physicalRoom.roomTypeId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: parseInt(adults, 10),
      children: parseInt(children, 10),
      extraBeds: parseInt(extraBeds, 10),
    });

    // 3. Concurrency-safe reference
    const referenceId = await generateSafeBookingReference();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanPaidAmount = parseFloat(paidAmount || "0");

    const result = await prisma.$transaction(async (tx) => {
      // Upsert Customer
      let customer = await tx.customer.findUnique({ where: { phone: cleanPhone } });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: cleanName,
            phone: cleanPhone,
            email: email ? email.trim() : null,
            address: address ? address.trim() : null,
            idProofType,
            idProofNumber,
            visitCount: 1,
          },
        });
      } else {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: cleanName,
            email: email ? email.trim() : customer.email,
            address: address ? address.trim() : customer.address,
            idProofType: idProofType || customer.idProofType,
            idProofNumber: idProofNumber || customer.idProofNumber,
            visitCount: customer.visitCount + 1,
          },
        });
      }

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          referenceId,
          customerId: customer.id,
          roomId: physicalRoom.roomTypeId,
          assignedRoomId: physicalRoom.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guestsCount: parseInt(guestsCount, 10),
          adults: parseInt(adults, 10),
          children: parseInt(children, 10),
          specialRequests,
          totalAmount: pricing.grossAmount,
          taxAmount: pricing.taxAmount,
          discountAmount: 0,
          netAmount: pricing.netAmount,
          paidAmount: cleanPaidAmount,
          appliedRoomRate: pricing.ratePerNight,
          appliedTaxRate: pricing.taxPercentage,
          pricingBreakdown: pricing.nightlyBreakdown as any,
          status: BookingStatus.CONFIRMED,
        },
      });

      // Create Room Assignment
      await tx.roomAssignment.create({
        data: {
          bookingId: booking.id,
          physicalRoomId: physicalRoom.id,
          assignedBy: currentStaff.name,
          status: AssignmentStatus.ASSIGNED,
          notes: "Walk-in reservation front desk allocation",
        },
      });

      // Create Primary Booking Guest
      await tx.bookingGuest.create({
        data: {
          bookingId: booking.id,
          name: cleanName,
          phone: cleanPhone,
          email: email ? email.trim() : null,
          idProofNumber,
          isPrimary: true,
        },
      });

      // Create Folio
      const folio = await getOrCreateFolio(booking.id, tx);

      // Record Walk-in payment if collected
      if (cleanPaidAmount > 0) {
        const paymentRecord = await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: cleanPaidAmount,
            method: paymentMethod as PaymentMethod,
            status: PaymentStatus.SUCCESS,
            receivedBy: currentStaff.name,
            referenceNote: paymentReferenceNote || `Walk-in collection at reception`,
          },
        });

        // Add payment to Folio
        await addFolioItem(
          {
            folioId: folio.id,
            itemType: FolioItemType.PAYMENT,
            description: `Payment Received (${paymentMethod}): ${paymentReferenceNote || "Front desk walk-in"}`,
            unitPrice: cleanPaidAmount,
            postedBy: currentStaff.name,
            referenceId: paymentRecord.id,
          },
          tx
        );

        // If Cash, find active cashier shift and log CashTransaction
        if (paymentMethod === "CASH") {
          const activeShift = await tx.cashierShift.findFirst({
            where: { status: "OPEN" },
            orderBy: { openedAt: "desc" },
          });

          if (activeShift) {
            await tx.cashTransaction.create({
              data: {
                shiftId: activeShift.id,
                type: "PAYMENT_RECEIVED",
                amount: cleanPaidAmount,
                reason: `Walk-in booking payment for ${booking.referenceId}`,
                bookingId: booking.id,
                paymentId: paymentRecord.id,
                recordedBy: currentStaff.name,
              },
            });

            await tx.cashierShift.update({
              where: { id: activeShift.id },
              data: {
                closingBalanceExpected: { increment: cleanPaidAmount },
              },
            });
          }
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "WALK_IN_BOOKING_CREATED",
          entity: "Booking",
          entityId: booking.id,
          details: `Walk-in booking created for ${cleanName} in Room ${physicalRoom.roomNumber} (${referenceId})`,
        },
      });

      return { booking, customer, folio };
    });

    // If autoCheckIn requested, trigger check-in state transition
    if (autoCheckIn) {
      await transitionBookingStatus({
        bookingId: result.booking.id,
        targetStatus: BookingStatus.CHECKED_IN,
        userId: currentStaff.userId,
        userName: currentStaff.name,
        reason: "Instant walk-in check-in",
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");

    return apiSuccess({
      booking: result.booking,
      customer: result.customer,
      folio: result.folio,
      roomNumber: physicalRoom.roomNumber,
      message: `Walk-in booking ${result.booking.referenceId} confirmed successfully${autoCheckIn ? " and checked in" : ""}.`,
    }, 201);
  } catch (error: any) {
    console.error("Walk-in Booking Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to process walk-in booking", 500);
  }
}
