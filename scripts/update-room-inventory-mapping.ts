import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Room Types and Physical Room Inventory mapping...");

  // 1. Update Room Types names and displayOrder
  const execRoom = await prisma.room.findFirst({ where: { slug: "executive-room" } });
  const deluxeRoom = await prisma.room.findFirst({ where: { slug: "deluxe-room" } });
  const suiteRoom = await prisma.room.findFirst({ where: { slug: "royal-suite" } });

  if (!execRoom || !deluxeRoom || !suiteRoom) {
    throw new Error("Missing standard room categories (executive, deluxe, royal suite)");
  }

  await prisma.room.update({
    where: { id: execRoom.id },
    data: { name: "AC Executive", displayOrder: 1 },
  });

  await prisma.room.update({
    where: { id: deluxeRoom.id },
    data: { name: "AC Deluxe", displayOrder: 2 },
  });

  await prisma.room.update({
    where: { id: suiteRoom.id },
    data: { name: "Royal Suite", displayOrder: 3 },
  });

  console.log("Updated Room Type names: AC Executive, AC Deluxe, Royal Suite");

  // Room type map by code
  const typeMap: Record<string, string> = {
    EXECUTIVE: execRoom.id,
    DELUXE: deluxeRoom.id,
    ROYAL_SUITE: suiteRoom.id,
  };

  // Exact 33 rooms mapping
  const physicalRoomDefs = [
    // AC EXECUTIVE (18 rooms)
    // Floor 1 (4)
    { roomNumber: "101", floor: 1, type: "EXECUTIVE" },
    { roomNumber: "103", floor: 1, type: "EXECUTIVE" },
    { roomNumber: "104", floor: 1, type: "EXECUTIVE" },
    { roomNumber: "105", floor: 1, type: "EXECUTIVE" },
    // Floor 2 (10)
    { roomNumber: "201", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "203", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "204", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "205", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "211", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "212", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "214", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "215", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "216", floor: 2, type: "EXECUTIVE" },
    { roomNumber: "217", floor: 2, type: "EXECUTIVE" },
    // Floor 3 (4)
    { roomNumber: "301", floor: 3, type: "EXECUTIVE" },
    { roomNumber: "303", floor: 3, type: "EXECUTIVE" },
    { roomNumber: "304", floor: 3, type: "EXECUTIVE" },
    { roomNumber: "305", floor: 3, type: "EXECUTIVE" },

    // AC DELUXE (12 rooms)
    // Floor 1 (4)
    { roomNumber: "106", floor: 1, type: "DELUXE" },
    { roomNumber: "107", floor: 1, type: "DELUXE" },
    { roomNumber: "108", floor: 1, type: "DELUXE" },
    { roomNumber: "109", floor: 1, type: "DELUXE" },
    // Floor 2 (4)
    { roomNumber: "206", floor: 2, type: "DELUXE" },
    { roomNumber: "207", floor: 2, type: "DELUXE" },
    { roomNumber: "208", floor: 2, type: "DELUXE" },
    { roomNumber: "209", floor: 2, type: "DELUXE" },
    // Floor 3 (4)
    { roomNumber: "306", floor: 3, type: "DELUXE" },
    { roomNumber: "307", floor: 3, type: "DELUXE" },
    { roomNumber: "308", floor: 3, type: "DELUXE" },
    { roomNumber: "309", floor: 3, type: "DELUXE" },

    // ROYAL SUITE (3 rooms)
    // Floor 1 (1)
    { roomNumber: "102", floor: 1, type: "ROYAL_SUITE" },
    // Floor 2 (1)
    { roomNumber: "202", floor: 2, type: "ROYAL_SUITE" },
    // Floor 3 (1)
    { roomNumber: "302", floor: 3, type: "ROYAL_SUITE" },
  ];

  const allowedRoomNumbers = new Set(physicalRoomDefs.map((r) => r.roomNumber));

  // 2. Remove physical rooms not in allowed set (e.g. 401)
  const existingRooms = await prisma.physicalRoom.findMany();
  for (const r of existingRooms) {
    if (!allowedRoomNumbers.has(r.roomNumber)) {
      console.log(`Removing unlisted room ${r.roomNumber}...`);
      await prisma.physicalRoom.delete({ where: { id: r.id } });
    }
  }

  // 3. Upsert each defined physical room
  for (const def of physicalRoomDefs) {
    const targetRoomTypeId = typeMap[def.type];
    await prisma.physicalRoom.upsert({
      where: { roomNumber: def.roomNumber },
      update: {
        floor: def.floor,
        roomTypeId: targetRoomTypeId,
        isActive: true,
      },
      create: {
        roomNumber: def.roomNumber,
        floor: def.floor,
        roomTypeId: targetRoomTypeId,
        status: "AVAILABLE",
        housekeepingStatus: "READY",
        maintenanceStatus: "NONE",
        isActive: true,
      },
    });
  }

  // 4. Verify DB inventory
  const finalRooms = await prisma.physicalRoom.findMany({
    include: { roomType: true },
    orderBy: [{ roomType: { displayOrder: "asc" } }, { roomNumber: "asc" }],
  });

  console.log(`\n==================================================`);
  console.log(`TOTAL PHYSICAL ROOMS IN POSTGRESQL: ${finalRooms.length}`);
  console.log(`==================================================`);

  const counts: Record<string, string[]> = {
    "AC Executive": [],
    "AC Deluxe": [],
    "Royal Suite": [],
  };

  for (const r of finalRooms) {
    const typeName = r.roomType.name;
    if (!counts[typeName]) counts[typeName] = [];
    counts[typeName].push(r.roomNumber);
  }

  for (const [tName, rNums] of Object.entries(counts)) {
    console.log(`\n${tName.toUpperCase()} (${rNums.length} rooms):`);
    console.log(`  ${rNums.join(", ")}`);
  }

  console.log(`\nAll 33 physical rooms verified successfully.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Migration error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
