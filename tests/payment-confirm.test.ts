import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { confirmBookingPayment } from "../src/lib/payment-confirm";
import { generateSafeBookingReference } from "../src/lib/sequence";
import { calculateBookingPricing } from "../src/lib/pricing";
import { BookingStatus, FolioStatus } from "@prisma/client";

async function testPaymentBookingFlow() {
  console.log("▶ Testing Payment Confirmation Business Logic & End-to-End Updates...");

  // 1. Locate an active Room Type
  const roomType = await prisma.room.findFirst({
    where: { slug: "executive-room" },
  });
  assert.ok(roomType, "Executive room category must exist");

  // 2. Create a test customer
  const customer = await prisma.customer.upsert({
    where: { phone: "9888888888" },
    update: {},
    create: {
      name: "Payment Flow Test Customer",
      phone: "9888888888",
      email: "payment.test@rajhans.com",
    },
  });

  // 3. Create a PENDING booking
  const checkIn = new Date("2029-01-10T12:00:00Z");
  const checkOut = new Date("2029-01-12T10:00:00Z");
  const pricing = await calculateBookingPricing({
    roomTypeId: roomType.id,
    checkIn,
    checkOut,
    adults: 2,
  });

  const ref = await generateSafeBookingReference();
  const booking = await prisma.booking.create({
    data: {
      referenceId: ref,
      customerId: customer.id,
      roomId: roomType.id,
      checkIn,
      checkOut,
      guestsCount: 2,
      adults: 2,
      totalAmount: pricing.grossAmount,
      taxAmount: pricing.taxAmount,
      netAmount: pricing.netAmount,
      paidAmount: 0,
      status: BookingStatus.PENDING,
    },
  });
  assert.equal(booking.status, BookingStatus.PENDING);
  assert.equal(booking.paidAmount, 0);

  const testOrderId = `order_${ref}`;
  const testPaymentId = `cf_pay_${Date.now()}`;

  // Pre-create initial PENDING payment record
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      cashfreeOrderId: testOrderId,
      amount: pricing.netAmount,
      currency: "INR",
      method: "UPI",
      status: "PENDING",
    },
  });

  // 4. Execute Payment Confirmation Pipeline
  console.log(`Simulating Cashfree successful payment verification for booking ${ref}...`);
  const result = await confirmBookingPayment({
    bookingId: booking.id,
    orderId: testOrderId,
    paymentId: testPaymentId,
    amount: pricing.netAmount,
    paymentMethod: "UPI",
    gatewayResponse: { payment_status: "SUCCESS", cf_payment_id: testPaymentId },
  });

  assert.equal(result.success, true);
  assert.equal(result.status, BookingStatus.CONFIRMED);
  assert.equal(result.paidAmount, pricing.netAmount);

  // 5. Verification Gate 1: Master Booking updated in DB
  const verifiedBooking = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: {
      payments: true,
      roomAssignments: { include: { physicalRoom: true } },
      folio: { include: { items: true } },
    },
  });

  assert.ok(verifiedBooking, "Booking must exist");
  assert.equal(verifiedBooking.status, BookingStatus.CONFIRMED, "Booking status must be CONFIRMED");
  assert.equal(verifiedBooking.paidAmount, pricing.netAmount, "Paid amount must match full net amount");
  assert.ok(verifiedBooking.assignedRoomId, "Physical room must be allocated");

  // 6. Verification Gate 2: Payment Table updated to SUCCESS
  const verifiedPayment = verifiedBooking.payments.find((p) => p.cashfreeOrderId === testOrderId);
  assert.ok(verifiedPayment, "Payment record must exist");
  assert.equal(verifiedPayment.status, "SUCCESS", "Payment status must be SUCCESS");
  assert.equal(verifiedPayment.cashfreePaymentId, testPaymentId, "Payment ID must match Cashfree ID");

  // 7. Verification Gate 3: Folio & Ledger Balance
  assert.ok(verifiedBooking.folio, "Folio must be created");
  assert.equal(verifiedBooking.folio.status, FolioStatus.SETTLED, "Folio must be SETTLED when paid in full");
  assert.equal(verifiedBooking.folio.totalPaid, pricing.netAmount, "Folio total paid must equal netAmount");
  assert.equal(verifiedBooking.folio.balanceAmount, 0, "Folio balance must be 0 after full payment");

  const paymentItem = verifiedBooking.folio.items.find((i) => i.itemType === "PAYMENT");
  assert.ok(paymentItem, "Folio must have PAYMENT line item");
  assert.equal(paymentItem.amount, pricing.netAmount);

  // 8. Verification Gate 4: Audit Log Written
  const auditLog = await prisma.auditLog.findFirst({
    where: { entityId: booking.id, action: "PAYMENT_CONFIRMED" },
  });
  assert.ok(auditLog, "Audit log record must be created for payment confirmation");

  // 9. Verification Gate 5: Outbox Event Queued
  const outbox = await prisma.outboxEvent.findFirst({
    where: { eventType: "BOOKING_CONFIRMED", payload: { path: ["bookingId"], equals: booking.id } },
  });
  assert.ok(outbox, "Outbox event for BOOKING_CONFIRMED must be enqueued");

  // 10. Verification Gate 6: Idempotency Protection
  console.log("Testing idempotency on duplicate payment callback...");
  const duplicateResult = await confirmBookingPayment({
    bookingId: booking.id,
    orderId: testOrderId,
    paymentId: testPaymentId,
    amount: pricing.netAmount,
  });
  assert.equal(duplicateResult.success, true);

  const refetchedFolio = await prisma.folio.findUnique({
    where: { bookingId: booking.id },
    include: { items: true },
  });
  const paymentItemsCount = refetchedFolio?.items.filter((i) => i.itemType === "PAYMENT").length;
  assert.equal(paymentItemsCount, 1, "Duplicate callback must NOT create duplicate payment folio items");

  console.log("✔ Payment Confirmation Pipeline: ALL 6 VERIFICATION GATES PASSED");

  // Cleanup test records
  console.log("Cleaning up test records...");
  await prisma.outboxEvent.deleteMany({ where: { payload: { path: ["bookingId"], equals: booking.id } } });
  await prisma.auditLog.deleteMany({ where: { entityId: booking.id } });
  await prisma.folioItem.deleteMany({ where: { folioId: verifiedBooking.folio.id } });
  await prisma.folio.delete({ where: { id: verifiedBooking.folio.id } });
  await prisma.roomAssignment.deleteMany({ where: { bookingId: booking.id } });
  await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  console.log("✔ Cleanup complete.");
}

testPaymentBookingFlow()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Payment Confirmation Flow Test Failed:", err);
    prisma.$disconnect();
    process.exit(1);
  });
