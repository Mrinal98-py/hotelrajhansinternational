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
