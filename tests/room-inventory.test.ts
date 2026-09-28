import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { getAvailablePhysicalRooms } from "../src/lib/inventory";
import { RoomBlockStatus, RoomBlockType } from "@prisma/client";

async function testRoomInventoryCalendar() {
  console.log("▶ Testing Physical Room Inventory Calendar & Date-Based Blocks...");

  // 1. Fetch an active physical room (e.g. Room 102)
  const room = await prisma.physicalRoom.findFirst({
    where: { isActive: true, roomType: { slug: "executive-room" } },
    include: { roomType: true },
  });
  assert.ok(room, "Must have active physical room for testing");

  const testStart = new Date("2028-12-01T00:00:00.000Z");
  const testEnd = new Date("2028-12-05T00:00:00.000Z");

  // Verify room is initially available in this future date window
  const initialAvailable = await getAvailablePhysicalRooms(
    room.roomTypeId,
    testStart,
    testEnd
  );
  const isInitiallyAvail = initialAvailable.some((r) => r.id === room.id);
  assert.equal(isInitiallyAvail, true, `Room ${room.roomNumber} should be available initially`);

  // 2. Create a RoomBlock for the room (e.g. VIP Hold from Dec 1 to Dec 5)
  console.log(`Blocking Room ${room.roomNumber} from 2028-12-01 to 2028-12-05...`);
  const block = await prisma.roomBlock.create({
    data: {
      physicalRoomId: room.id,
      startDate: testStart,
      endDate: testEnd,
      reason: "TEST_VIP_BLOCK",
      blockType: RoomBlockType.VIP_HOLD,
      status: RoomBlockStatus.ACTIVE,
      createdBy: "TEST_SUITE",
    },
  });
  assert.ok(block.id, "Block record must be created in DB");

  // 3. Verify getAvailablePhysicalRooms now EXCLUDES this room
  const afterBlockAvailable = await getAvailablePhysicalRooms(
    room.roomTypeId,
    testStart,
    testEnd
  );
  const isBlockedNow = !afterBlockAvailable.some((r) => r.id === room.id);
  assert.equal(
    isBlockedNow,
    true,
    `CRITICAL: Blocked Room ${room.roomNumber} must NOT be available during block dates!`
  );

  // 4. Verify dates outside block (e.g. Dec 6 to Dec 10) are still available
  const outsideBlockAvailable = await getAvailablePhysicalRooms(
    room.roomTypeId,
    new Date("2028-12-06T00:00:00.000Z"),
    new Date("2028-12-10T00:00:00.000Z")
  );
  const isAvailableOutside = outsideBlockAvailable.some((r) => r.id === room.id);
  assert.equal(
    isAvailableOutside,
    true,
    `Room ${room.roomNumber} should remain available outside block window`
  );

  // 5. Unblock room and verify availability is restored
  console.log(`Unblocking Room ${room.roomNumber}...`);
  await prisma.roomBlock.update({
    where: { id: block.id },
    data: { status: RoomBlockStatus.RELEASED },
  });

  const afterReleaseAvailable = await getAvailablePhysicalRooms(
    room.roomTypeId,
    testStart,
    testEnd
  );
  const isRestored = afterReleaseAvailable.some((r) => r.id === room.id);
  assert.equal(
    isRestored,
    true,
    `Room ${room.roomNumber} availability must be restored after releasing block`
  );

  // Clean up block record
  await prisma.roomBlock.delete({ where: { id: block.id } });

  console.log("✔ Physical Room Inventory Calendar: ALL TAPE CHART & BLOCK TESTS PASSED");
}

testRoomInventoryCalendar()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Room Inventory Test Failed:", err);
    process.exit(1);
  });
