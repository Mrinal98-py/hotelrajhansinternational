import { prisma } from "../src/lib/prisma";

const EXPECTED_ROOMS = [
  // Floor 1
  "101", "102", "103", "104", "105", "106", "107", "108", "109",
  // Floor 2
  "201", "202", "203", "204", "205", "206", "207", "208", "209",
  "211", "212", "214", "215", "216", "217",
  // Floor 3
  "301", "302", "303", "304", "305", "306", "307", "308", "309",
];

const EXPECTED_EXECUTIVE = [
  "101", "103", "104", "105",
  "201", "203", "204", "205", "211", "212", "214", "215", "216", "217",
  "301", "303", "304", "305",
];

const EXPECTED_DELUXE = [
  "106", "107", "108", "109",
  "206", "207", "208", "209",
  "306", "307", "308", "309",
];

const EXPECTED_ROYAL_SUITE = ["102", "202", "302"];

export async function validateDatabaseInventory() {
  console.log("================================================================================");
  console.log("VALIDATING DATABASE INVENTORY & PHYSICAL ROOM ARCHITECTURE (Section 54)");
  console.log("================================================================================");

  // 1. Validate Room Categories (RoomTypes)
  const roomTypes = await prisma.room.findMany({
    orderBy: { name: "asc" },
  });

  console.log(`Found ${roomTypes.length} Room Categories:`);
  for (const rt of roomTypes) {
    console.log(`  • ${rt.name} (type: ${rt.type}, ID: ${rt.id})`);
  }

  if (roomTypes.length !== 3) {
    throw new Error(`Expected exactly 3 Room Categories, found ${roomTypes.length}`);
  }

  // 2. Validate Physical Rooms Total
  const physicalRooms = await prisma.physicalRoom.findMany({
    include: { roomType: true },
    orderBy: { roomNumber: "asc" },
  });

  console.log(`\nFound ${physicalRooms.length} Physical Rooms in PostgreSQL (Neon):`);
  if (physicalRooms.length !== 33) {
    throw new Error(`Expected exactly 33 physical rooms, found ${physicalRooms.length}`);
  }

  // 3. Validate Counts by Room Category
  const executiveRooms = physicalRooms.filter((r) => r.roomType.type === "EXECUTIVE");
  const deluxeRooms = physicalRooms.filter((r) => r.roomType.type === "DELUXE");
  const suiteRooms = physicalRooms.filter((r) => r.roomType.type === "ROYAL_SUITE");

  console.log(`  • AC EXECUTIVE: ${executiveRooms.length} rooms (Expected: 18)`);
  console.log(`  • AC DELUXE:    ${deluxeRooms.length} rooms (Expected: 12)`);
  console.log(`  • ROYAL SUITE:  ${suiteRooms.length} rooms (Expected: 3)`);

  if (executiveRooms.length !== 18) {
    throw new Error(`Executive count mismatch: expected 18, got ${executiveRooms.length}`);
  }
  if (deluxeRooms.length !== 12) {
    throw new Error(`Deluxe count mismatch: expected 12, got ${deluxeRooms.length}`);
  }
  if (suiteRooms.length !== 3) {
    throw new Error(`Royal Suite count mismatch: expected 3, got ${suiteRooms.length}`);
  }

  // 4. Validate Exact Room Numbers
  const roomNumbers = physicalRooms.map((r) => r.roomNumber);
  const duplicates = roomNumbers.filter((item, index) => roomNumbers.indexOf(item) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Found duplicate room numbers: ${duplicates.join(", ")}`);
  }

  const missingRooms = EXPECTED_ROOMS.filter((rn) => !roomNumbers.includes(rn));
  if (missingRooms.length > 0) {
    throw new Error(`Missing expected rooms: ${missingRooms.join(", ")}`);
  }

  const unexpectedRooms = roomNumbers.filter((rn) => !EXPECTED_ROOMS.includes(rn));
  if (unexpectedRooms.length > 0) {
    throw new Error(`Unexpected rooms found: ${unexpectedRooms.join(", ")}`);
  }

  // 5. Validate Exact Room-to-Type Mapping
  const execNumbers = executiveRooms.map((r) => r.roomNumber);
  const deluxeNumbers = deluxeRooms.map((r) => r.roomNumber);
  const suiteNumbers = suiteRooms.map((r) => r.roomNumber);

  for (const en of EXPECTED_EXECUTIVE) {
    if (!execNumbers.includes(en)) {
      throw new Error(`Room ${en} should be in AC EXECUTIVE category`);
    }
  }

  for (const dn of EXPECTED_DELUXE) {
    if (!deluxeNumbers.includes(dn)) {
      throw new Error(`Room ${dn} should be in AC DELUXE category`);
    }
  }

  for (const sn of EXPECTED_ROYAL_SUITE) {
    if (!suiteNumbers.includes(sn)) {
      throw new Error(`Room ${sn} should be in ROYAL SUITE category`);
    }
  }

  console.log("\n✔ Room Numbers Check: All 33 room numbers match perfectly with zero duplicates.");
  console.log("✔ Category Mapping Check: All 33 physical rooms correctly mapped to their respective RoomType.");
  console.log("================================================================================");
  console.log("✔ FINAL DATABASE VALIDATION PASSED (100% INVENTORY INTEGRITY)");
  console.log("================================================================================");
}

validateDatabaseInventory()
  .catch((err) => {
    console.error("❌ Database Inventory Validation Failed:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
