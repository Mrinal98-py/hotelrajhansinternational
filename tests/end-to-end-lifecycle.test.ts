import { prisma } from "../src/lib/prisma";
import { generateSafeBookingReference } from "../src/lib/sequence";
import { confirmBookingPayment } from "../src/lib/payment-confirm";
import { transitionBookingStatus } from "../src/lib/booking-state";
import { transferPhysicalRoomAtomic } from "../src/lib/inventory";
import { addFolioItem } from "../src/lib/folio";
import {
  BookingStatus,
  RoomStatus,
  HousekeepingStatus,
  AssignmentStatus,
  FolioItemType,
  FolioStatus,
  TaskStatus,
} from "@prisma/client";

async function runEndToEndLifecycleTest() {
  console.log("================================================================================");
  console.log("RUNNING: End-to-End Hotel Guest & Operational Lifecycle Test");
  console.log("================================================================================");

  // 0. Locate AC Executive Room Category
  const execCategory = await prisma.room.findFirst({
    where: { name: { contains: "Executive" } },
    include: { physicalRooms: true },
  });

  if (!execCategory || execCategory.physicalRooms.length < 2) {
    throw new Error("AC Executive room category with at least 2 physical rooms required for test");
  }

  const roomA = execCategory.physicalRooms[0];
  const roomB = execCategory.physicalRooms[1];

  // 1. Create Test Customer
  const testPhone = `9899${Math.floor(100000 + Math.random() * 900000)}`;
  const customer = await prisma.customer.create({
    data: {
      name: "E2E Lifecycle Guest",
      phone: testPhone,
      email: "e2e.guest@hotelrajhans.test",
    },
  });

  const refId = await generateSafeBookingReference();
  const today = new Date();
  const checkIn = new Date(today.getFullYear() + 2, 5, 10);
  const checkOut = new Date(today.getFullYear() + 2, 5, 12); // 2 nights

  // 2. Stage 1: Guest Books Executive Room (PENDING)
  console.log(`▶ Stage 1: Creating Pending Booking ${refId}...`);
  const booking = await prisma.booking.create({
    data: {
      referenceId: refId,
      customerId: customer.id,
      roomId: execCategory.id,
      checkIn,
      checkOut,
      guestsCount: 2,
      adults: 2,
      totalAmount: 4000,
      taxAmount: 480,
      discountAmount: 0,
      netAmount: 4480,
      paidAmount: 0,
      status: BookingStatus.PENDING,
    },
  });

  if (booking.status !== BookingStatus.PENDING) {
    throw new Error("Stage 1 Failed: Booking should be in PENDING status");
  }
  console.log(`  ✔ Booking created in PENDING status`);

  // 3. Stage 2: Payment & Atomic Room Allocation
  console.log(`▶ Stage 2: Simulating Cashfree Payment & Atomic Room Allocation...`);
  const paymentConfirm = await confirmBookingPayment({
    bookingId: booking.id,
    orderId: `order_e2e_${Date.now()}`,
    paymentId: `cf_pay_e2e_${Date.now()}`,
    amount: 4480,
    paymentMethod: "UPI",
    gatewayResponse: { test: true },
  });

  const confirmedBooking = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: { roomAssignments: true, folio: true },
  });

  if (confirmedBooking?.status !== BookingStatus.CONFIRMED) {
    throw new Error("Stage 2 Failed: Booking status must be CONFIRMED");
  }
  if (!confirmedBooking.assignedRoomId) {
    throw new Error("Stage 2 Failed: Physical room was not allocated");
  }
  if (!confirmedBooking.folio || confirmedBooking.folio.balanceAmount !== 0) {
    throw new Error("Stage 2 Failed: Folio balance must be settled to ₹0 upon payment");
  }
  console.log(`  ✔ Booking CONFIRMED, Room ${paymentConfirm.assignedRoomNumber} allocated, Folio ${paymentConfirm.folioNumber} settled`);

  const initialAssignedRoomId = confirmedBooking.assignedRoomId;

  // 4. Stage 3: Guest Arrival & Check-In
  console.log(`▶ Stage 3: Guest Arrives — Front Desk Check-In...`);
  await transitionBookingStatus({
    bookingId: booking.id,
    targetStatus: BookingStatus.CHECKED_IN,
    userName: "Front Desk Staff",
  });

  const checkedInBooking = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: { roomAssignments: { where: { status: "ACTIVE" } } },
  });

  const roomAfterCheckIn = await prisma.physicalRoom.findUnique({
    where: { id: initialAssignedRoomId },
  });

  if (checkedInBooking?.status !== BookingStatus.CHECKED_IN) {
    throw new Error("Stage 3 Failed: Booking must be CHECKED_IN");
  }
  if (!checkedInBooking.actualCheckInAt) {
    throw new Error("Stage 3 Failed: actualCheckInAt must be recorded");
  }
  if (roomAfterCheckIn?.status !== RoomStatus.OCCUPIED) {
    throw new Error("Stage 3 Failed: Physical room must be OCCUPIED");
  }
  console.log(`  ✔ Guest checked in at ${checkedInBooking.actualCheckInAt.toISOString()}, Room ${roomAfterCheckIn.roomNumber} status: OCCUPIED`);

  // 5. Stage 4: Restaurant Charge Posted to Folio
  console.log(`▶ Stage 4: Restaurant F&B Charge Posted to Folio...`);
  await addFolioItem({
    folioId: confirmedBooking.folio.id,
    itemType: FolioItemType.RESTAURANT,
    description: "Takshshila Restaurant Dinner Order #1042",
    unitPrice: 650,
    taxRate: 5,
    postedBy: "Restaurant Cashier",
  });

  const folioAfterFood = await prisma.folio.findUnique({
    where: { id: confirmedBooking.folio.id },
  });

  if (!folioAfterFood || folioAfterFood.balanceAmount <= 0) {
    throw new Error("Stage 4 Failed: Folio balance must reflect outstanding restaurant charge");
  }
  console.log(`  ✔ Restaurant charge posted: Folio balance is now ₹${folioAfterFood.balanceAmount} (Status: ${folioAfterFood.status})`);

  // 6. Stage 5: Laundry Charge Posted to Folio
  console.log(`▶ Stage 5: Laundry Service Charge Posted to Folio...`);
  await addFolioItem({
    folioId: confirmedBooking.folio.id,
    itemType: FolioItemType.LAUNDRY,
    description: "Express Laundry Service - 4 Garments",
    unitPrice: 200,
    taxRate: 18,
    postedBy: "Housekeeping Desk",
  });

  const folioAfterLaundry = await prisma.folio.findUnique({
    where: { id: confirmedBooking.folio.id },
  });
  console.log(`  ✔ Laundry charge posted: Folio balance is now ₹${folioAfterLaundry?.balanceAmount}`);

  // 7. Stage 6: Room Transfer (Guest requests room change)
  console.log(`▶ Stage 6: Room Transfer to Another Physical Room...`);
  // Target a different room in the same category
  const targetRoom = execCategory.physicalRooms.find((r) => r.id !== initialAssignedRoomId)!;
  const transferResult = await transferPhysicalRoomAtomic({
    bookingId: booking.id,
    toPhysicalRoomId: targetRoom.id,
    reason: "GUEST_REQUEST",
    notes: "Guest requested quiet corner room",
    performedBy: "Duty Manager",
  });

  const roomTransferRecord = await prisma.roomTransfer.findFirst({
    where: { bookingId: booking.id },
  });

  const oldRoomAfterTransfer = await prisma.physicalRoom.findUnique({
    where: { id: initialAssignedRoomId },
  });
  const newRoomAfterTransfer = await prisma.physicalRoom.findUnique({
    where: { id: targetRoom.id },
  });

  if (!roomTransferRecord) {
    throw new Error("Stage 6 Failed: RoomTransfer record was not created");
  }
  if (oldRoomAfterTransfer?.status !== RoomStatus.DIRTY) {
    throw new Error("Stage 6 Failed: Vacated room must be marked DIRTY for cleaning");
  }
  if (newRoomAfterTransfer?.status !== RoomStatus.OCCUPIED) {
    throw new Error("Stage 6 Failed: New target room must be marked OCCUPIED");
  }
  console.log(`  ✔ Transferred from Room ${transferResult.fromRoomNumber} to ${transferResult.toRoomNumber} atomically`);

  // 8. Stage 7: Settle Outstanding Folio Balance (Split / Additional Payment)
  console.log(`▶ Stage 7: Settling Folio Outstanding Balance before Checkout...`);
  const outstandingAmount = folioAfterLaundry!.balanceAmount;
  await addFolioItem({
    folioId: confirmedBooking.folio.id,
    itemType: FolioItemType.PAYMENT,
    description: "Front Desk Cash Payment for Extras",
    unitPrice: outstandingAmount,
    postedBy: "Front Desk Cashier",
  });

  const settledFolio = await prisma.folio.findUnique({
    where: { id: confirmedBooking.folio.id },
  });

  if (!settledFolio || settledFolio.balanceAmount > 0 || settledFolio.status !== FolioStatus.SETTLED) {
    throw new Error("Stage 7 Failed: Folio balance must be ₹0 and status SETTLED");
  }
  console.log(`  ✔ Folio balance settled to ₹0 (Status: ${settledFolio.status})`);

  // 9. Stage 8: Check-Out Guest
  console.log(`▶ Stage 8: Front Desk Checkout & Housekeeping Task Auto-Generation...`);
  await transitionBookingStatus({
    bookingId: booking.id,
    targetStatus: BookingStatus.CHECKED_OUT,
    userName: "Front Desk Staff",
  });

  const checkedOutBooking = await prisma.booking.findUnique({
    where: { id: booking.id },
  });

  const occupiedRoomAfterCheckout = await prisma.physicalRoom.findUnique({
    where: { id: targetRoom.id },
  });

  const checkoutTask = await prisma.housekeepingTask.findFirst({
    where: { physicalRoomId: targetRoom.id, taskType: "CHECKOUT_CLEAN" },
    orderBy: { createdAt: "desc" },
  });

  if (checkedOutBooking?.status !== BookingStatus.CHECKED_OUT) {
    throw new Error("Stage 8 Failed: Booking must be CHECKED_OUT");
  }
  if (!checkedOutBooking.actualCheckOutAt) {
    throw new Error("Stage 8 Failed: actualCheckOutAt must be recorded");
  }
  if (occupiedRoomAfterCheckout?.housekeepingStatus !== HousekeepingStatus.DIRTY) {
    throw new Error("Stage 8 Failed: Room housekeeping must be DIRTY on checkout");
  }
  if (!checkoutTask) {
    throw new Error("Stage 8 Failed: Checkout cleaning task was not auto-created");
  }
  console.log(`  ✔ Checkout complete at ${checkedOutBooking.actualCheckOutAt.toISOString()}. Room ${occupiedRoomAfterCheckout.roomNumber} marked DIRTY`);

  // 10. Stage 9: Housekeeping Workflow (DIRTY -> CLEANING -> INSPECTION -> READY)
  console.log(`▶ Stage 9: Housekeeping Cleaning & Inspection Lifecycle...`);
  // A. Housekeeper starts cleaning
  await prisma.physicalRoom.update({
    where: { id: targetRoom.id },
    data: { housekeepingStatus: HousekeepingStatus.CLEANING },
  });
  await prisma.housekeepingTask.update({
    where: { id: checkoutTask.id },
    data: { status: TaskStatus.IN_PROGRESS },
  });

  // B. Housekeeper finishes cleaning
  await prisma.physicalRoom.update({
    where: { id: targetRoom.id },
    data: { housekeepingStatus: HousekeepingStatus.CLEAN },
  });

  // C. Supervisor inspects and approves room -> READY & AVAILABLE
  await prisma.physicalRoom.update({
    where: { id: targetRoom.id },
    data: {
      status: RoomStatus.AVAILABLE,
      housekeepingStatus: HousekeepingStatus.READY,
    },
  });
  await prisma.housekeepingTask.update({
    where: { id: checkoutTask.id },
    data: { status: TaskStatus.COMPLETED },
  });

  const finalRoom = await prisma.physicalRoom.findUnique({
    where: { id: targetRoom.id },
  });

  if (finalRoom?.housekeepingStatus !== HousekeepingStatus.READY || finalRoom?.status !== RoomStatus.AVAILABLE) {
    throw new Error("Stage 9 Failed: Room must be READY and AVAILABLE after supervisor approval");
  }
  console.log(`  ✔ Room ${finalRoom.roomNumber} cleaned, inspected, and set to READY & AVAILABLE`);

  // 11. Cleanup test records
  console.log("▶ Cleaning up E2E test records...");
  await prisma.folioItem.deleteMany({ where: { folioId: confirmedBooking.folio.id } });
  await prisma.folio.delete({ where: { id: confirmedBooking.folio.id } });
  await prisma.roomTransfer.deleteMany({ where: { bookingId: booking.id } });
  await prisma.roomAssignment.deleteMany({ where: { bookingId: booking.id } });
  await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
  await prisma.housekeepingTask.deleteMany({ where: { id: checkoutTask.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.customer.delete({ where: { id: customer.id } });

  // Reset room statuses back to original
  await prisma.physicalRoom.update({
    where: { id: initialAssignedRoomId },
    data: { status: RoomStatus.AVAILABLE, housekeepingStatus: HousekeepingStatus.READY },
  });
  await prisma.physicalRoom.update({
    where: { id: targetRoom.id },
    data: { status: RoomStatus.AVAILABLE, housekeepingStatus: HousekeepingStatus.READY },
  });

  console.log("✔ Cleanup complete.");
  console.log("================================================================================");
  console.log("✔ End-to-End Hotel Guest & Operational Lifecycle Test: ALL 9 STAGES PASSED");
  console.log("================================================================================");
}

runEndToEndLifecycleTest().catch((err) => {
  console.error("❌ E2E Lifecycle Test Failed:", err);
  process.exit(1);
});
