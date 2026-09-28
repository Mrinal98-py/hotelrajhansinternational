import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { allocatePhysicalRoomAtomic, getAvailablePhysicalRooms } from "../src/lib/inventory";
import { generateSafeBookingReference } from "../src/lib/sequence";
import { BookingStatus } from "@prisma/client";

async function testConcurrencyDoubleBooking() {
  console.log("▶ Testing Concurrency Double-Booking Protection (Simultaneous Allocations)...");

  // 1. Find Room Category (e.g. Deluxe Room or Executive Room)
  const roomType = await prisma.room.findFirst({
    where: { slug: "executive-room" },
    include: { physicalRooms: { where: { isActive: true } } },
  });
  assert.ok(roomType, "Executive room type must exist");

  const totalPhysicalRooms = roomType.physicalRooms.length;
  console.log(`Found ${totalPhysicalRooms} physical rooms for ${roomType.name}`);

  // Test date far in the future to avoid clashing with real stays
  const testCheckIn = new Date("2028-11-10T12:00:00Z");
  const testCheckOut = new Date("2028-11-12T10:00:00Z");

  // 2. Create customer for testing
  let customer = await prisma.customer.findFirst({
    where: { phone: "9999999999" },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: "Concurrency Test Customer",
        phone: "9999999999",
        email: "test.concurrency@rajhans.com",
      },
    });
  }

  // 3. Pre-create 20 pending bookings for the test dates
  const totalConcurrentRequests = 20;
  console.log(`Creating ${totalConcurrentRequests} simultaneous booking records...`);

  const createdBookings: any[] = [];
  for (let i = 0; i < totalConcurrentRequests; i++) {
    const ref = await generateSafeBookingReference();
    const b = await prisma.booking.create({
      data: {
        referenceId: ref,
        customerId: customer.id,
        roomId: roomType.id,
        checkIn: testCheckIn,
        checkOut: testCheckOut,
        guestsCount: 2,
        totalAmount: 4000,
        taxAmount: 480,
        netAmount: 4480,
        paidAmount: 4480,
        status: BookingStatus.CONFIRMED,
      },
    });
    createdBookings.push(b);
  }

  // 4. Launch simultaneous parallel physical room allocation requests
  console.log(`Firing ${totalConcurrentRequests} simultaneous allocation requests...`);
  const allocationPromises = createdBookings.map((b) =>
    allocatePhysicalRoomAtomic(b.id, roomType.id, testCheckIn, testCheckOut)
      .then((assignedRoomId) => ({ success: true, bookingId: b.id, assignedRoomId }))
      .catch((err) => ({ success: false, bookingId: b.id, error: err.message }))
  );

  const results = await Promise.all(allocationPromises);

  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(
    `Results: ${succeeded.length} succeeded, ${failed.length} rejected with inventory limits.`
  );

  // 5. Verification 1: Number of confirmed allocations cannot exceed total physical room capacity
  assert.ok(
    succeeded.length <= totalPhysicalRooms,
    `Capacity violation! Succeeded (${succeeded.length}) > total physical rooms (${totalPhysicalRooms})`
  );

  // 6. Verification 2: Check for ANY overlapping physical room assignments
  const assignedRoomIds = succeeded
    .filter((s): s is { success: true; bookingId: string; assignedRoomId: string } => "assignedRoomId" in s)
    .map((s) => s.assignedRoomId);
  const uniqueAssignedRooms = new Set(assignedRoomIds);

  assert.equal(
    uniqueAssignedRooms.size,
    assignedRoomIds.length,
    `DOUBLE-BOOKING DETECTED! Assigned physical room IDs contain duplicates: ${assignedRoomIds}`
  );

  console.log(
    `✔ Concurrency Protection: ${succeeded.length} physical rooms allocated uniquely without a single collision.`
  );

  // 7. Cleanup test records
  console.log("Cleaning up test reservations...");
  const bookingIds = createdBookings.map((b) => b.id);
  await prisma.roomAssignment.deleteMany({
    where: { bookingId: { in: bookingIds } },
  });
  await prisma.folio.deleteMany({
    where: { bookingId: { in: bookingIds } },
  });
  await prisma.booking.deleteMany({
    where: { id: { in: bookingIds } },
  });

  console.log("✔ Cleanup complete. ZERO DOUBLE-BOOKING PROOF CONFIRMED.");
}

testConcurrencyDoubleBooking()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Concurrency Test Failed:", err);
    process.exit(1);
  });
