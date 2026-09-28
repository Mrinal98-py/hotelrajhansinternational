import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Physical Rooms, Departments, Drawers & Policies...");

  // 1. Fetch Room Types
  const roomTypes = await prisma.room.findMany();
  const roomMap = new Map(roomTypes.map((r) => [r.type, r.id]));

  const execId = roomMap.get("EXECUTIVE");
  const deluxeId = roomMap.get("DELUXE");
  const suiteId = roomMap.get("ROYAL_SUITE");
  const dormId = roomMap.get("DORMITORY");

  // 2. Physical Rooms Setup (Exact 33 physical rooms)
  const physicalRoomDefs = [
    // AC EXECUTIVE (18 rooms)
    // Floor 1 (4)
    { roomNumber: "101", floor: 1, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "103", floor: 1, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "104", floor: 1, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "105", floor: 1, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    // Floor 2 (10)
    { roomNumber: "201", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "203", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "204", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "205", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "211", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "212", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "214", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "215", floor: 2, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const, roomTypeId: execId! },
    { roomNumber: "216", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "217", floor: 2, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    // Floor 3 (4)
    { roomNumber: "301", floor: 3, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "303", floor: 3, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "304", floor: 3, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "305", floor: 3, roomTypeId: execId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },

    // AC DELUXE (12 rooms)
    // Floor 1 (4)
    { roomNumber: "106", floor: 1, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "107", floor: 1, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "108", floor: 1, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "109", floor: 1, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    // Floor 2 (4)
    { roomNumber: "206", floor: 2, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "207", floor: 2, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "208", floor: 2, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "209", floor: 2, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    // Floor 3 (4)
    { roomNumber: "306", floor: 3, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "307", floor: 3, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "308", floor: 3, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    { roomNumber: "309", floor: 3, roomTypeId: deluxeId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },

    // ROYAL SUITE (3 rooms)
    // Floor 1 (1)
    { roomNumber: "102", floor: 1, roomTypeId: suiteId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    // Floor 2 (1)
    { roomNumber: "202", floor: 2, roomTypeId: suiteId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
    // Floor 3 (1)
    { roomNumber: "302", floor: 3, roomTypeId: suiteId!, status: "AVAILABLE" as const, housekeepingStatus: "READY" as const },
  ];

  const allowedRoomNumbers = new Set(physicalRoomDefs.map((r) => r.roomNumber));
  const currentRooms = await prisma.physicalRoom.findMany();
  for (const r of currentRooms) {
    if (!allowedRoomNumbers.has(r.roomNumber)) {
      await prisma.physicalRoom.delete({ where: { id: r.id } });
    }
  }

  for (const def of physicalRoomDefs) {
    if (!def.roomTypeId) continue;
    await prisma.physicalRoom.upsert({
      where: { roomNumber: def.roomNumber },
      update: {
        floor: def.floor,
        roomTypeId: def.roomTypeId,
        isActive: true,
      },
      create: {
        roomNumber: def.roomNumber,
        floor: def.floor,
        roomTypeId: def.roomTypeId,
        status: def.status,
        housekeepingStatus: def.housekeepingStatus,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${physicalRoomDefs.length} physical rooms.`);

  // 3. Departments
  const departments = [
    { name: "Front Office & Reception", code: "FRONT_OFFICE", description: "Guest reception, check-in, bookings" },
    { name: "Housekeeping", code: "HOUSEKEEPING", description: "Room sanitation, cleaning, inventory replenishment" },
    { name: "Maintenance & Engineering", code: "MAINTENANCE", description: "Electrical, plumbing, HVAC maintenance" },
    { name: "Food & Beverage / Restaurant", code: "RESTAURANT", description: "Restaurant operations, room service" },
    { name: "Management & Accounts", code: "MANAGEMENT", description: "Financial audit, administration" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, description: dept.description },
      create: dept,
    });
  }
  console.log("Seeded hotel departments.");

  // 4. Default Cash Drawer
  await prisma.cashDrawer.upsert({
    where: { name: "Front Desk Cash Drawer 1" },
    update: {},
    create: {
      name: "Front Desk Cash Drawer 1",
      currentBalance: 0,
      isActive: true,
    },
  });
  console.log("Seeded Front Desk Cash Drawer.");

  // 5. Default Cancellation Policies
  const policies = [
    {
      name: "Standard Flexible (24h)",
      description: "Full refund if cancelled 24 hours prior to check-in. Non-refundable afterwards.",
      hoursBeforeCheckIn: 24,
      refundPercentage: 100,
      feeAmount: 0,
      isActive: true,
    },
    {
      name: "Strict Non-Refundable",
      description: "Non-refundable at any time after booking confirmation.",
      hoursBeforeCheckIn: 0,
      refundPercentage: 0,
      feeAmount: 0,
      isActive: true,
    },
  ];

  for (const p of policies) {
    await prisma.cancellationPolicy.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }
  console.log("Seeded cancellation policies.");

  // 6. Connect Existing Confirmed Booking to Room 101 and Create Folio if missing
  const existingBooking = await prisma.booking.findFirst({
    where: { status: "CONFIRMED" },
    include: { folio: true },
  });

  if (existingBooking) {
    const room101 = await prisma.physicalRoom.findUnique({
      where: { roomNumber: "101" },
    });

    if (room101) {
      await prisma.booking.update({
        where: { id: existingBooking.id },
        data: {
          assignedRoomId: room101.id,
        },
      });

      // Upsert Room Assignment
      const existingAssignment = await prisma.roomAssignment.findFirst({
        where: { bookingId: existingBooking.id, physicalRoomId: room101.id },
      });

      if (!existingAssignment) {
        await prisma.roomAssignment.create({
          data: {
            bookingId: existingBooking.id,
            physicalRoomId: room101.id,
            status: "ASSIGNED",
            notes: "Automatic system migration allocation",
          },
        });
      }

      // Upsert Folio for existing confirmed booking
      if (!existingBooking.folio) {
        const folioNumber = `FOL-${existingBooking.referenceId.replace("HRJ-", "")}`;
        const folio = await prisma.folio.create({
          data: {
            bookingId: existingBooking.id,
            folioNumber,
            status: "OPEN",
            totalCharges: existingBooking.netAmount,
            totalTaxes: existingBooking.taxAmount,
            totalDiscounts: existingBooking.discountAmount,
            totalPaid: existingBooking.paidAmount,
            balanceAmount: existingBooking.netAmount - existingBooking.paidAmount,
          },
        });

        // Add Room Charge item
        await prisma.folioItem.create({
          data: {
            folioId: folio.id,
            itemType: "ROOM_CHARGE",
            description: "Room Tariff Charges",
            quantity: 1,
            unitPrice: existingBooking.totalAmount,
            amount: existingBooking.totalAmount,
            taxRate: 12,
            taxAmount: existingBooking.taxAmount,
            postedBy: "System Migration",
          },
        });

        // Add Payment item
        await prisma.folioItem.create({
          data: {
            folioId: folio.id,
            itemType: "PAYMENT",
            description: "Cashfree PG Verified Payment",
            quantity: 1,
            unitPrice: existingBooking.paidAmount,
            amount: existingBooking.paidAmount,
            taxRate: 0,
            taxAmount: 0,
            postedBy: "Cashfree PG",
          },
        });
      }
    }
  }

  // 7. Seed System Sequence counters if not present
  await prisma.systemSequence.upsert({
    where: { name: "BOOKING_REF" },
    update: {},
    create: {
      name: "BOOKING_REF",
      currentVal: 100,
      prefix: "HRJ",
    },
  });

  await prisma.systemSequence.upsert({
    where: { name: "FOLIO_NUM" },
    update: {},
    create: {
      name: "FOLIO_NUM",
      currentVal: 100,
      prefix: "FOL",
    },
  });

  await prisma.systemSequence.upsert({
    where: { name: "RESTAURANT_ORDER" },
    update: {},
    create: {
      name: "RESTAURANT_ORDER",
      currentVal: 100,
      prefix: "RES",
    },
  });

  // 8. Seed sample Menu Categories & Items for Restaurant POS
  const catBreakfast = await prisma.menuCategory.upsert({
    where: { name: "Breakfast & Beverages" },
    update: {},
    create: { name: "Breakfast & Beverages", displayOrder: 1 },
  });

  const catMains = await prisma.menuCategory.upsert({
    where: { name: "Main Course" },
    update: {},
    create: { name: "Main Course", displayOrder: 2 },
  });

  await prisma.menuItem.upsert({
    where: { id: "menu-masala-chai" },
    update: {},
    create: {
      id: "menu-masala-chai",
      categoryId: catBreakfast.id,
      name: "Special Masala Chai",
      description: "Brewed with fresh ginger and cardamom",
      price: 50,
      isVeg: true,
      isAvailable: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "menu-paneer-butter" },
    update: {},
    create: {
      id: "menu-paneer-butter",
      categoryId: catMains.id,
      name: "Paneer Butter Masala",
      description: "Rich creamy cottage cheese curry with Indian spices",
      price: 320,
      isVeg: true,
      isAvailable: true,
    },
  });

  // 9. Seed Hotel Services
  const services = [
    { name: "Laundry & Dry Cleaning", category: "LAUNDRY" as const, price: 150, taxRate: 18, description: "Per item garment laundering and ironing" },
    { name: "Station Pickup & Drop (BGP Junction)", category: "TRANSPORT" as const, price: 350, taxRate: 5, description: "Private AC cab transfer" },
    { name: "Extra Bed Setup", category: "OTHER" as const, price: 500, taxRate: 12, description: "Rollaway mattress with linens and toiletries" },
  ];

  for (const s of services) {
    const existingService = await prisma.hotelService.findFirst({ where: { name: s.name } });
    if (!existingService) {
      await prisma.hotelService.create({ data: s });
    }
  }

  console.log("Seeding complete successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
