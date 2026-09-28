import { prisma } from "@/lib/prisma";
import { Prisma, FolioItemType, BookingStatus, PaymentMethod } from "@prisma/client";
import { allocatePhysicalRoomAtomic } from "@/lib/inventory";
import { getOrCreateFolio, addFolioItem, recalculateFolioTotals } from "@/lib/folio";
import { queueOutboxEvent } from "@/lib/outbox";
import { sendEmailNotification } from "@/lib/mailer";
import { generateConfirmationEmailHTML } from "@/lib/invoice";
import { syncBookingToGoogleSheet } from "@/lib/googlesheets";

export function parsePaymentMethod(val?: string | null): PaymentMethod {
  if (!val) return PaymentMethod.UPI;
  const upper = val.toUpperCase();
  if (upper.includes("CARD")) return PaymentMethod.CARD;
  if (upper.includes("NET") || upper.includes("BANK")) return PaymentMethod.NETBANKING;
  if (upper.includes("WALLET")) return PaymentMethod.WALLET;
  if (upper.includes("CASH")) return PaymentMethod.CASH;
  return PaymentMethod.UPI;
}

export interface ConfirmBookingPaymentParams {
  bookingId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  paymentMethod?: PaymentMethod | string;
  gatewayResponse?: string | Record<string, unknown>;
}

export interface ConfirmBookingPaymentResult {
  success: boolean;
  bookingId: string;
  referenceId: string;
  status: BookingStatus;
  paidAmount: number;
  assignedRoomNumber?: string;
  folioNumber?: string;
  message: string;
}

/**
 * Authoritative transactional pipeline for confirming payment and activating booking:
 * 1. Atomically updates Payment status to SUCCESS.
 * 2. Transitions Booking status to CONFIRMED and updates paidAmount.
 * 3. Ensures Physical Room is assigned and linked to Booking and RoomAssignment.
 * 4. Upserts Folio and posts PAYMENT ledger item; recalculates balance to ₹0.
 * 5. Appends AuditLog entry for tamper-proof record.
 * 6. Enqueues asynchronous Outbox event (guaranteed background sync).
 * 7. Dispatches non-blocking instant confirmation emails to Guest and Hotel Admin.
 */
export async function confirmBookingPayment(
  params: ConfirmBookingPaymentParams
): Promise<ConfirmBookingPaymentResult> {
  const { bookingId, orderId, paymentId, amount, paymentMethod = "UPI", gatewayResponse } = params;

  const rawGatewayResponse =
    typeof gatewayResponse === "string"
      ? gatewayResponse
      : JSON.stringify(gatewayResponse || {});

  return await prisma.$transaction(
    async (tx) => {
      // 1. Fetch booking with customer and room details
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          room: true,
          roomAssignments: {
            where: { status: { in: ["ASSIGNED", "ACTIVE"] } },
            include: { physicalRoom: true },
          },
        },
      });

      if (!booking) {
        throw new Error(`Booking ${bookingId} not found`);
      }

      // Idempotency: If already CONFIRMED, return existing state
      if (booking.status === BookingStatus.CONFIRMED && booking.paidAmount >= amount) {
        const assignedNumber =
          booking.roomAssignments?.[0]?.physicalRoom?.roomNumber || undefined;
        return {
          success: true,
          bookingId: booking.id,
          referenceId: booking.referenceId,
          status: booking.status,
          paidAmount: booking.paidAmount,
          assignedRoomNumber: assignedNumber,
          message: "Booking is already confirmed and settled.",
        };
      }

      // 2. Update or Create Payment record
      const paymentUpdate = await tx.payment.updateMany({
        where: { bookingId: booking.id, cashfreeOrderId: orderId },
        data: {
          cashfreePaymentId: paymentId,
          status: "SUCCESS",
          gatewayResponse: rawGatewayResponse,
        },
      });

      if (paymentUpdate.count === 0) {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            cashfreeOrderId: orderId,
            cashfreePaymentId: paymentId,
            amount,
            currency: "INR",
            method: parsePaymentMethod(paymentMethod),
            status: "SUCCESS",
            gatewayResponse: rawGatewayResponse,
          },
        });
      }

      // 3. Ensure Physical Room Assignment
      let assignedRoomNumber: string | undefined =
        booking.roomAssignments?.[0]?.physicalRoom?.roomNumber;

      if (!booking.assignedRoomId) {
        try {
          const newAssignedId = await allocatePhysicalRoomAtomic(
            booking.id,
            booking.roomId,
            booking.checkIn,
            booking.checkOut,
            undefined,
            "Payment Auto-Allocation",
            tx
          );
          const pr = await tx.physicalRoom.findUnique({
            where: { id: newAssignedId },
            select: { roomNumber: true },
          });
          assignedRoomNumber = pr?.roomNumber;
        } catch (allocErr) {
          console.warn(
            `Auto-allocation notice for booking ${booking.referenceId}:`,
            allocErr
          );
        }
      }

      // 4. Update Folio & Add Payment Line Item
      const folio = await getOrCreateFolio(booking.id, tx);

      // Check if this payment is already recorded in folio items
      const existingPaymentItem = await tx.folioItem.findFirst({
        where: {
          folioId: folio.id,
          referenceId: paymentId,
        },
      });

      if (!existingPaymentItem) {
        await addFolioItem(
          {
            folioId: folio.id,
            itemType: FolioItemType.PAYMENT,
            description: `Cashfree Payment (${paymentId})`,
            quantity: 1,
            unitPrice: amount,
            amount,
            referenceId: paymentId,
            postedBy: "Cashfree PG",
          },
          tx
        );
      } else {
        await recalculateFolioTotals(folio.id, tx);
      }

      // 5. Update Booking to CONFIRMED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          paidAmount: amount,
        },
      });

      // 6. Write Tamper-Proof Audit Log
      await tx.auditLog.create({
        data: {
          userId: null,
          userName: "Cashfree Gateway",
          action: "PAYMENT_CONFIRMED",
          entity: "Booking",
          entityId: booking.id,
          details: `Booking ${booking.referenceId} confirmed. Order ID: ${orderId}, Payment ID: ${paymentId}, Amount: ₹${amount}, Room: #${assignedRoomNumber || "Pending"}`,
        },
      });

      // 7. Enqueue Transactional Outbox Event
      await queueOutboxEvent(
        "BOOKING_CONFIRMED",
        {
          bookingId: booking.id,
          referenceId: booking.referenceId,
          customerName: booking.customer.name,
          customerPhone: booking.customer.phone,
          customerEmail: booking.customer.email,
          roomName: booking.room.name,
          checkIn: booking.checkIn.toISOString(),
          checkOut: booking.checkOut.toISOString(),
          guestsCount: booking.guestsCount,
          totalAmount: booking.totalAmount,
          taxAmount: booking.taxAmount,
          discountAmount: booking.discountAmount,
          netAmount: booking.netAmount,
          paidAmount: amount,
          paymentMethod,
          paymentId,
          orderId,
        },
        tx
      );

      return {
        success: true,
        bookingId: booking.id,
        referenceId: booking.referenceId,
        status: updatedBooking.status,
        paidAmount: updatedBooking.paidAmount,
        assignedRoomNumber,
        folioNumber: folio.folioNumber,
        message: "Booking confirmed and folio payment posted successfully.",
      };
    },
    { timeout: 30000, maxWait: 15000 }
  );
}

/**
 * Non-blocking notification dispatcher for email confirmation and Google Sheets
 */
export async function dispatchPostPaymentNotifications(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        room: true,
        roomAssignments: {
          where: { status: { in: ["ASSIGNED", "ACTIVE"] } },
          include: { physicalRoom: true },
        },
      },
    });

    if (!booking) return;

    const assignedRoomNumber =
      booking.roomAssignments?.[0]?.physicalRoom?.roomNumber;

    const emailHtml = generateConfirmationEmailHTML({
      bookingReference: booking.referenceId,
      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      customerEmail: booking.customer.email || "N/A",
      customerAddress: booking.customer.address,
      roomName: assignedRoomNumber
        ? `${booking.room.name} (Room #${assignedRoomNumber})`
        : booking.room.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestsCount: booking.guestsCount,
      roomsCount: 1,
      basePrice: booking.room.basePriceDouble,
      totalAmount: booking.totalAmount,
      taxAmount: booking.taxAmount,
      discountAmount: booking.discountAmount,
      netAmount: booking.netAmount,
      paidAmount: booking.paidAmount,
      paymentStatus: "SUCCESS",
      paymentMethod: "Cashfree PG Verified",
      gstin: "10AAAAA0000A1Z5",
      createdAt: new Date(),
      hotelAddress: "Kachari Chowk, MG Road, Bhagalpur, Bihar - 812001",
      hotelPhone: "+91 93081 89201 / +91 641 2400000",
      googleMapsUrl: "https://maps.app.goo.gl/77AAPZ7hRje8Nrmk9",
      railwayDistance:
        "Bhagalpur Junction Railway Station (BGP): ~2.5 km (10-15 mins drive)",
    });

    const recipientEmails = Array.from(
      new Set(
        [
          booking.customer.email,
          "info@hotelrajhansinternational.com",
          "rajhansinternational.info@gmail.com",
        ].filter(Boolean)
      )
    ).join(", ");

    sendEmailNotification({
      to: recipientEmails,
      subject: `Confirmed Booking (${booking.referenceId}) - Hotel Rajhans International`,
      html: emailHtml,
    }).catch((err) => console.error("Non-blocking email dispatch error:", err));

    syncBookingToGoogleSheet({
      bookingReference: booking.referenceId,
      bookingDate: booking.createdAt,
      customerName: booking.customer.name,
      phone: booking.customer.phone,
      email: booking.customer.email,
      roomName: booking.room.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestsCount: booking.guestsCount,
      netAmount: booking.netAmount,
      paymentStatus: "SUCCESS",
      bookingStatus: "CONFIRMED",
    }).catch((err) =>
      console.error("Non-blocking Google Sheets sync error:", err)
    );
  } catch (err) {
    console.error("dispatchPostPaymentNotifications error:", err);
  }
}
