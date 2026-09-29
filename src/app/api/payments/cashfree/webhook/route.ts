import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import { confirmBookingPayment, dispatchPostPaymentNotifications } from "@/lib/payment-confirm";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    // 1. Read Raw Body (Crucial for HMAC SHA256 calculation)
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    // 2. Cryptographic Signature Verification
    const isValidSignature = verifyCashfreeWebhookSignature(rawBody, timestamp, signature);

    if (!isValidSignature) {
      console.warn("Cashfree Webhook Signature Verification Failed:", {
        signature,
        timestamp,
        bodyPreview: rawBody.slice(0, 100),
      });
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    // 3. Parse JSON Body
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventType = payload.type || payload.event;
    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};

    const orderId = orderData.order_id || payload.order_id;
    const paymentId = paymentData.cf_payment_id || paymentData.payment_id;
    const paymentStatus = paymentData.payment_status || orderData.order_status;

    if (!orderId) {
      return NextResponse.json({ status: "OK", message: "Ignored: Missing orderId" }, { status: 200 });
    }

    // 4. Find Payment Record in Database
    const paymentRecord = await prisma.payment.findFirst({
      where: { cashfreeOrderId: orderId },
      include: {
        booking: {
          include: { customer: true, room: true },
        },
      },
    });

    if (!paymentRecord || !paymentRecord.booking) {
      console.warn(`Cashfree Webhook: Payment record for order ${orderId} not found.`);
      return NextResponse.json({ status: "OK", message: "Payment record not found" }, { status: 200 });
    }

    const booking = paymentRecord.booking;

    // 5. Idempotent Skip
    if (booking.status === "CONFIRMED") {
      return NextResponse.json({ status: "OK", message: "Idempotent: Booking already confirmed" }, { status: 200 });
    }

    // 6. Process Payment Success Event
    if (
      eventType === "PAYMENT_SUCCESS_WEBHOOK" ||
      paymentStatus === "SUCCESS" ||
      orderData.order_status === "PAID"
    ) {
      // Validate payment currency if present in webhook payload
      if (paymentData?.payment_currency && paymentData.payment_currency.toUpperCase() !== "INR") {
        console.error("Webhook rejected: non-INR currency", paymentData.payment_currency);
        return NextResponse.json({ error: "Invalid currency. INR expected." }, { status: 400 });
      }

      // Validate payment amount if present in webhook payload
      if (paymentData?.payment_amount !== undefined && Number(paymentData.payment_amount) < booking.netAmount) {
        console.error("Webhook rejected: payment amount mismatch", paymentData.payment_amount, booking.netAmount);
        return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });
      }

      const paymentMethod = paymentData?.payment_method
        ? Object.keys(paymentData.payment_method)[0]?.toUpperCase()
        : "WEBHOOK";

      await confirmBookingPayment({
        bookingId: booking.id,
        orderId,
        paymentId: String(paymentId || `cf_pay_${Date.now()}`),
        amount: booking.netAmount,
        paymentMethod,
        gatewayResponse: rawBody,
      });

      // Non-blocking notifications (email + Google Sheets)
      dispatchPostPaymentNotifications(booking.id);

      return NextResponse.json(
        { status: "SUCCESS", message: "Webhook processed and booking confirmed" },
        { status: 200 }
      );
    }

    return NextResponse.json({ status: "OK", message: "Event ignored or unhandled" }, { status: 200 });
  } catch (error) {
    console.error("Cashfree Webhook Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
