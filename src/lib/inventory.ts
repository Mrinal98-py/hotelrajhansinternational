import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface AvailablePhysicalRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  roomTypeName: string;
  housekeepingStatus: string;
  status: string;
}

/**
 * Checks physical room availability for a given room category and date range.
 * Considers active/maintenance physical rooms, active room assignments, and confirmed/checked-in bookings.
 */
export async function getAvailablePhysicalRooms(
  roomTypeId: string,
  checkIn: Date | string,
  checkOut: Date | string,
  tx?: Prisma.TransactionClient
): Promise<AvailablePhysicalRoom[]> {
  const client = tx || prisma;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // 1. Fetch all active physical rooms of this room type that are NOT in critical maintenance or deactivated
  const physicalRooms = await client.physicalRoom.findMany({
    where: {
      roomTypeId,
      isActive: true,
      status: { notIn: ["MAINTENANCE", "OUT_OF_ORDER", "DEACTIVATED"] },
      maintenanceStatus: { notIn: ["OUT_OF_ORDER", "UNDER_REPAIR"] },
    },
    include: {
      roomType: { select: { name: true } },
    },
    orderBy: { roomNumber: "asc" },
  });

  if (physicalRooms.length === 0) {
    return [];
  }

  const roomIds = physicalRooms.map((r) => r.id);

  // 2. Find any active room assignments that overlap with the requested dates
  const overlappingAssignments = await client.roomAssignment.findMany({
    where: {
      physicalRoomId: { in: roomIds },
      status: { in: ["ASSIGNED", "ACTIVE"] },
      booking: {
        status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    },
    select: { physicalRoomId: true },
  });

  const occupiedIds = new Set(overlappingAssignments.map((a) => a.physicalRoomId));

  // Also check if any bookings for this room category have assignedRoomId set
  const overlappingBookings = await client.booking.findMany({
    where: {
      roomId: roomTypeId,
      assignedRoomId: { in: roomIds },
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
      AND: [
        { checkIn: { lt: checkOutDate } },
        { checkOut: { gt: checkInDate } },
      ],
    },
    select: { assignedRoomId: true },
  });

  for (const b of overlappingBookings) {
    if (b.assignedRoomId) {
      occupiedIds.add(b.assignedRoomId);
    }
  }

  // 3. Find any active room blocks that overlap with the requested dates
  const overlappingBlocks = await client.roomBlock.findMany({
    where: {
      physicalRoomId: { in: roomIds },
      status: "ACTIVE",
      AND: [
        { startDate: { lt: checkOutDate } },
        { endDate: { gt: checkInDate } },
      ],
    },
    select: { physicalRoomId: true },
  });

  for (const block of overlappingBlocks) {
    occupiedIds.add(block.physicalRoomId);
  }

  return physicalRooms
    .filter((room) => !occupiedIds.has(room.id))
    .map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomTypeId: room.roomTypeId,
      roomTypeName: room.roomType.name,
      housekeepingStatus: room.housekeepingStatus,
      status: room.status,
    }));
}

/**
 * Validates inventory availability and atomically assigns a physical room under a transaction lock.
 * If 100 requests arrive concurrently, only available rooms will be assigned.
 */
export async function allocatePhysicalRoomAtomic(
  bookingId: string,
  roomTypeId: string,
  checkIn: Date | string,
  checkOut: Date | string,
  preferredPhysicalRoomId?: string,
  assignedBy: string = "System Allocation",
  tx?: Prisma.TransactionClient
): Promise<string> {
  const runner = async (client: Prisma.TransactionClient) => {
    // Acquire PostgreSQL Row-Level Exclusive Lock on the Room category to serialize concurrent allocation
    await client.$queryRawUnsafe(`SELECT "id" FROM "Room" WHERE "id" = $1 FOR UPDATE`, roomTypeId);

    const availableRooms = await getAvailablePhysicalRooms(roomTypeId, checkIn, checkOut, client);

    if (availableRooms.length === 0) {
      throw new Error("No physical rooms available for the selected dates and room category");
    }

    let targetRoom: AvailablePhysicalRoom | undefined;
    if (preferredPhysicalRoomId) {
      targetRoom = availableRooms.find((r) => r.id === preferredPhysicalRoomId);
      if (!targetRoom) {
        throw new Error(`Requested physical room is not available for these dates`);
      }
    } else {
      // Pick best ready room
      targetRoom =
        availableRooms.find((r) => r.housekeepingStatus === "READY") || availableRooms[0];
    }

    // Atomically link to booking
    await client.booking.update({
      where: { id: bookingId },
      data: { assignedRoomId: targetRoom.id },
    });

    // Create or update room assignment
    await client.roomAssignment.create({
      data: {
        bookingId,
        physicalRoomId: targetRoom.id,
        status: "ASSIGNED",
        assignedBy,
      },
    });

    return targetRoom.id;
  };

  if (tx) {
    return await runner(tx);
  } else {
    return await prisma.$transaction(async (client) => {
      return await runner(client);
    }, { timeout: 30000, maxWait: 15000 });
  }
}

/**
 * Transfers a booking's assigned physical room to another room atomically.
 * Preserves historical assignments (marks previous as TRANSFERRED) and records in RoomTransfer table.
 */
export async function transferPhysicalRoomAtomic(params: {
  bookingId: string;
  toPhysicalRoomId: string;
  reason?: "GUEST_REQUEST" | "MAINTENANCE" | "UPGRADE" | "OPERATIONAL" | "OTHER";
  notes?: string;
  performedBy?: string;
  tx?: Prisma.TransactionClient;
}): Promise<{
  transfer: any;
  fromRoomNumber: string;
  toRoomNumber: string;
}> {
  const {
    bookingId,
    toPhysicalRoomId,
    reason = "GUEST_REQUEST",
    notes,
    performedBy = "Staff",
    tx,
  } = params;

  const runner = async (client: Prisma.TransactionClient) => {
    const booking = await client.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomAssignments: { where: { status: { in: ["ASSIGNED", "ACTIVE"] } } },
      },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (booking.status === "CANCELLED" || booking.status === "CHECKED_OUT") {
      throw new Error(`Cannot transfer room for booking with status ${booking.status}`);
    }

    const fromPhysicalRoomId = booking.assignedRoomId;
    if (!fromPhysicalRoomId) {
      throw new Error("Booking does not have an active physical room assigned to transfer from.");
    }

    if (fromPhysicalRoomId === toPhysicalRoomId) {
      throw new Error("Target physical room cannot be the same as current room.");
    }

    // Target room verification
    const toRoom = await client.physicalRoom.findUnique({
      where: { id: toPhysicalRoomId },
      include: { roomType: true },
    });

    if (!toRoom || !toRoom.isActive) {
      throw new Error("Target physical room not found or is inactive");
    }

    if (
      toRoom.status === "MAINTENANCE" ||
      toRoom.status === "OUT_OF_ORDER" ||
      toRoom.status === "DEACTIVATED"
    ) {
      throw new Error(`Room ${toRoom.roomNumber} is currently under maintenance or out of order`);
    }

    // Check overlap on target room
    const overlapping = await client.roomAssignment.findFirst({
      where: {
        physicalRoomId: toPhysicalRoomId,
        status: { in: ["ASSIGNED", "ACTIVE"] },
        bookingId: { not: bookingId },
        booking: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
          AND: [
            { checkIn: { lt: booking.checkOut } },
            { checkOut: { gt: booking.checkIn } },
          ],
        },
      },
    });

    if (overlapping) {
      throw new Error(`Room ${toRoom.roomNumber} is already occupied/reserved for these dates`);
    }

    // Check room block on target room
    const overlappingBlock = await client.roomBlock.findFirst({
      where: {
        physicalRoomId: toPhysicalRoomId,
        status: "ACTIVE",
        AND: [
          { startDate: { lt: booking.checkOut } },
          { endDate: { gt: booking.checkIn } },
        ],
      },
    });

    if (overlappingBlock) {
      throw new Error(`Room ${toRoom.roomNumber} is blocked for ${overlappingBlock.reason}`);
    }

    const fromRoom = await client.physicalRoom.findUnique({
      where: { id: fromPhysicalRoomId },
    });

    const fromRoomNumber = fromRoom?.roomNumber || "Unknown";
    const toRoomNumber = toRoom.roomNumber;

    // 1. Mark existing active assignment as TRANSFERRED
    await client.roomAssignment.updateMany({
      where: {
        bookingId,
        status: { in: ["ASSIGNED", "ACTIVE"] },
      },
      data: {
        status: "TRANSFERRED",
      },
    });

    // 2. Create new RoomAssignment
    const newStatus = booking.status === "CHECKED_IN" ? "ACTIVE" : "ASSIGNED";
    await client.roomAssignment.create({
      data: {
        bookingId,
        physicalRoomId: toPhysicalRoomId,
        status: newStatus,
        assignedBy: performedBy,
        checkInTime: booking.status === "CHECKED_IN" ? new Date() : null,
        notes: notes || `Transferred from room ${fromRoomNumber} (${reason})`,
      },
    });

    // 3. Create immutable RoomTransfer record
    const transfer = await client.roomTransfer.create({
      data: {
        bookingId,
        fromPhysicalRoomId,
        toPhysicalRoomId,
        reason: reason as any,
        notes,
        performedBy,
      },
    });

    // 4. Update Booking assigned room pointer
    await client.booking.update({
      where: { id: bookingId },
      data: {
        assignedRoomId: toPhysicalRoomId,
      },
    });

    // 5. Update room statuses if guest is already checked in
    if (booking.status === "CHECKED_IN") {
      // Old room needs cleaning
      await client.physicalRoom.update({
        where: { id: fromPhysicalRoomId },
        data: {
          status: "DIRTY",
          housekeepingStatus: "DIRTY",
        },
      });

      // Target room is now occupied
      await client.physicalRoom.update({
        where: { id: toPhysicalRoomId },
        data: {
          status: "OCCUPIED",
        },
      });
    }

    // 6. Write Audit Log
    await client.auditLog.create({
      data: {
        userId: null,
        userName: performedBy,
        action: "ROOM_TRANSFER",
        entity: "Booking",
        entityId: bookingId,
        details: `Room transferred from ${fromRoomNumber} to ${toRoomNumber}. Reason: ${reason}. Notes: ${notes || "None"}`,
      },
    });

    return {
      transfer,
      fromRoomNumber,
      toRoomNumber,
    };
  };

  if (tx) {
    return await runner(tx);
  } else {
    return await prisma.$transaction(async (client) => {
      return await runner(client);
    }, { timeout: 30000, maxWait: 15000 });
  }
}

