import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCashfreeOrderPayments } from "@/lib/cashfree";
import { confirmBookingPayment, dispatchPostPaymentNotifications } from "@/lib/payment-confirm";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { bookingId, orderId } = body;

    if (!bookingId || !orderId) {
      return NextResponse.json(
        { success: false, error: "Booking ID and Order ID are required." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, room: true, payments: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    // 1. Idempotency Check: Skip duplicate processing if already CONFIRMED
    if (booking.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        status: "CONFIRMED",
        bookingReference: booking.referenceId,
        message: "Booking is already confirmed.",
      });
    }

    const refId = booking.referenceId;

    // 2. Fetch Order & Payment Status from Cashfree PG
    const { orderStatus, payments } = await fetchCashfreeOrderPayments(orderId);
    const successfulPayment = payments.find(
      (p) => p.payment_status === "SUCCESS"
    );

    const isVerified =
      orderStatus.toUpperCase() === "PAID" ||
      orderStatus.toUpperCase() === "SUCCESS" ||
      Boolean(successfulPayment);

    if (!isVerified) {
      return NextResponse.json(
        {
          success: false,
          status: "PENDING",
          error: "Payment verification pending or not settled.",
          bookingReference: refId,
        },
        { status: 200 }
      );
    }

    const paymentId = successfulPayment?.cf_payment_id || `cf_pay_${orderId}`;
    const paymentMethod = successfulPayment?.payment_group || "UPI";

    // Strict Server-Side Payment Security Validation
    if (successfulPayment) {
      if (successfulPayment.payment_currency && successfulPayment.payment_currency.toUpperCase() !== "INR") {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid payment currency ${successfulPayment.payment_currency}. Only INR transactions are accepted.`,
          },
          { status: 400 }
        );
      }

      if (
        successfulPayment.payment_amount !== undefined &&
        successfulPayment.payment_amount < booking.netAmount
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Payment amount mismatch: Received ₹${successfulPayment.payment_amount}, expected ₹${booking.netAmount}.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Authoritative Transactional Payment Confirmation Pipeline
    const confirmResult = await confirmBookingPayment({
      bookingId: booking.id,
      orderId,
      paymentId,
      amount: booking.netAmount,
      paymentMethod,
      gatewayResponse: { verified: true, orderStatus, payments },
    });

    // 4. Non-blocking Post-Payment Notifications (Guest + Hotel Admin + Google Sheets)
    dispatchPostPaymentNotifications(booking.id);

    return NextResponse.json(
      {
        success: true,
        status: "CONFIRMED",
        bookingReference: confirmResult.referenceId,
        assignedRoomNumber: confirmResult.assignedRoomNumber,
        folioNumber: confirmResult.folioNumber,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Verify Cashfree Payment Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}
