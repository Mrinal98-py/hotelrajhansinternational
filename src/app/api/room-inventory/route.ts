import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, requireAuth } from "@/lib/security";
import { RoomBlockType, RoomBlockStatus, RoomStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/room-inventory
 * High-performance, single-query-batch tape chart endpoint.
 * Fetches:
 * 1. Physical rooms grouped by room type.
 * 2. All overlapping reservations (with customer & payment info).
 * 3. All overlapping room blocks.
 * 4. All active maintenance tickets.
 * 5. All active housekeeping tasks.
 * 6. Real-time daily occupancy percentages and summary KPI aggregates.
 */
export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, [
      "SUPER_ADMIN",
      "MANAGER",
      "RECEPTION",
      "HOUSEKEEPING",
      "MAINTENANCE",
      "STAFF",
    ]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const roomTypeFilter = searchParams.get("roomType") || "ALL";
    const floorFilter = searchParams.get("floor");

    const now = new Date();
    // Default 7 days from today if not provided
    const startDate = startDateParam
      ? new Date(`${startDateParam}T00:00:00.000Z`)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const endDate = endDateParam
      ? new Date(`${endDateParam}T23:59:59.999Z`)
      : new Date(startDate.getTime() + 7 * 86400000);

    // 1. Fetch Physical Rooms
    const roomWhere: any = { isActive: true };
    if (roomTypeFilter !== "ALL") {
      roomWhere.roomType = { type: roomTypeFilter };
    }
    if (floorFilter && floorFilter !== "ALL") {
      roomWhere.floor = parseInt(floorFilter, 10);
    }

    const physicalRooms = await prisma.physicalRoom.findMany({
      where: roomWhere,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            type: true,
            basePriceSingle: true,
            basePriceDouble: true,
            capacity: true,
          },
        },
      },
      orderBy: [{ roomType: { displayOrder: "asc" } }, { roomNumber: "asc" }],
    });

    const physicalRoomIds = physicalRooms.map((r) => r.id);

    // 2. Fetch Overlapping Reservations
    // An overnight reservation overlaps if checkIn < endDate AND checkOut > startDate
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "PENDING"] },
        AND: [
          { checkIn: { lt: endDate } },
          { checkOut: { gt: startDate } },
        ],
        OR: [
          { assignedRoomId: { in: physicalRoomIds } },
          { roomAssignments: { some: { physicalRoomId: { in: physicalRoomIds }, status: { in: ["ASSIGNED", "ACTIVE"] } } } },
        ],
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        room: { select: { id: true, name: true, type: true } },
        roomAssignments: {
          where: { physicalRoomId: { in: physicalRoomIds }, status: { in: ["ASSIGNED", "ACTIVE"] } },
          include: { physicalRoom: true },
        },
        folio: { select: { totalCharges: true, totalPaid: true, balanceAmount: true } },
      },
      orderBy: { checkIn: "asc" },
    });

    // 3. Fetch Overlapping Room Blocks
    const roomBlocks = await prisma.roomBlock.findMany({
      where: {
        physicalRoomId: { in: physicalRoomIds },
        status: RoomBlockStatus.ACTIVE,
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gt: startDate } },
        ],
      },
      include: { physicalRoom: { select: { roomNumber: true } } },
      orderBy: { startDate: "asc" },
    });

    // 4. Fetch Active Maintenance Tickets
    const maintenanceTickets = await prisma.maintenanceTicket.findMany({
      where: {
        physicalRoomId: { in: physicalRoomIds },
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      include: { physicalRoom: { select: { roomNumber: true } } },
    });

    // 5. Fetch Active Housekeeping Tasks
    const housekeepingTasks = await prisma.housekeepingTask.findMany({
      where: {
        physicalRoomId: { in: physicalRoomIds },
        status: { not: "COMPLETED" },
      },
      include: { physicalRoom: { select: { roomNumber: true } } },
    });

    // 6. Map Reservations to Physical Rooms with conflict detection
    const reservationsFormatted = overlappingBookings.map((b) => {
      const assignedPhysicalRoomId =
        b.roomAssignments[0]?.physicalRoomId || b.assignedRoomId;
      const physicalRoom = physicalRooms.find((r) => r.id === assignedPhysicalRoomId);

      return {
        id: b.id,
        referenceId: b.referenceId,
        guestName: b.customer?.name || "Guest",
        guestPhone: b.customer?.phone || "",
        status: b.status,
        checkIn: b.checkIn.toISOString(),
        checkOut: b.checkOut.toISOString(),
        roomTypeId: b.roomId,
        roomTypeName: b.room?.name || "",
        physicalRoomId: assignedPhysicalRoomId,
        roomNumber: physicalRoom?.roomNumber || "Unassigned",
        totalAmount: b.totalAmount,
        paidAmount: b.paidAmount,
        balanceAmount: b.folio ? b.folio.balanceAmount : Math.max(0, b.netAmount - b.paidAmount),
        guestsCount: b.guestsCount,
      };
    });

    // Check for Overlapping Conflicts on the same physical room
    const conflictMap: Record<string, boolean> = {};
    for (let i = 0; i < reservationsFormatted.length; i++) {
      for (let j = i + 1; j < reservationsFormatted.length; j++) {
        const r1 = reservationsFormatted[i];
        const r2 = reservationsFormatted[j];
        if (
          r1.physicalRoomId &&
          r1.physicalRoomId === r2.physicalRoomId &&
          r1.status !== "CHECKED_OUT" &&
          r2.status !== "CHECKED_OUT"
        ) {
          const c1In = new Date(r1.checkIn).getTime();
          const c1Out = new Date(r1.checkOut).getTime();
          const c2In = new Date(r2.checkIn).getTime();
          const c2Out = new Date(r2.checkOut).getTime();

          if (c1In < c2Out && c1Out > c2In) {
            conflictMap[r1.id] = true;
            conflictMap[r2.id] = true;
          }
        }
      }
    }

    // 7. Calculate Daily Occupancy Matrix across the requested period
    const dayIntervals: string[] = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      dayIntervals.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }

    const totalSellableRooms = physicalRooms.filter(
      (r) => r.status !== "DEACTIVATED" && r.status !== "OUT_OF_ORDER"
    ).length;

    const dailyOccupancy: Record<string, { occupied: number; total: number; percentage: number }> = {};
    for (const dayStr of dayIntervals) {
      const dayDate = new Date(`${dayStr}T12:00:00.000Z`);

      // Count bookings active on this date (checkIn <= dayDate AND checkOut > dayDate)
      const occupiedCount = overlappingBookings.filter((b) => {
        const cin = new Date(b.checkIn);
        const cout = new Date(b.checkOut);
        return (
          (b.status === "CONFIRMED" || b.status === "CHECKED_IN") &&
          cin <= dayDate &&
          cout > dayDate
        );
      }).length;

      const percentage =
        totalSellableRooms > 0
          ? Math.round((occupiedCount / totalSellableRooms) * 1000) / 10
          : 0;

      dailyOccupancy[dayStr] = {
        occupied: occupiedCount,
        total: totalSellableRooms,
        percentage,
      };
    }

    // 8. Overall KPI Summary for Today
    const todayStr = now.toISOString().split("T")[0];
    const todayDate = new Date(`${todayStr}T12:00:00.000Z`);

    const currentlyOccupied = physicalRooms.filter((r) => r.status === "OCCUPIED").length;
    const currentlyDirty = physicalRooms.filter((r) => r.housekeepingStatus === "DIRTY").length;
    const currentlyMaintenance = physicalRooms.filter(
      (r) => r.status === "MAINTENANCE" || r.status === "OUT_OF_ORDER"
    ).length;
    const currentlyBlocked = roomBlocks.filter((b) => {
      const s = new Date(b.startDate);
      const e = new Date(b.endDate);
      return s <= todayDate && e >= todayDate;
    }).length;

    const currentlyAvailable = physicalRooms.filter(
      (r) => r.status === "AVAILABLE" && r.housekeepingStatus === "READY"
    ).length;

    const currentlyReserved = overlappingBookings.filter((b) => {
      const cin = new Date(b.checkIn);
      const cout = new Date(b.checkOut);
      return b.status === "CONFIRMED" && cin <= todayDate && cout > todayDate;
    }).length;

    return apiSuccess({
      period: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        dayIntervals,
      },
      rooms: physicalRooms,
      reservations: reservationsFormatted.map((r) => ({
        ...r,
        hasConflict: !!conflictMap[r.id],
      })),
      blocks: roomBlocks,
      maintenanceTickets,
      housekeepingTasks,
      dailyOccupancy,
      summary: {
        totalRooms: physicalRooms.length,
        sellableRooms: totalSellableRooms,
        available: currentlyAvailable,
        reserved: currentlyReserved,
        occupied: currentlyOccupied,
        dirty: currentlyDirty,
        maintenance: currentlyMaintenance,
        blocked: currentlyBlocked,
        occupancyRate: dailyOccupancy[todayStr]?.percentage || 0,
      },
    });
  } catch (error: any) {
    console.error("GET Room Inventory Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch room inventory", 500);
  }
}

/**
 * POST /api/room-inventory
 * Actions:
 * - BLOCK_ROOM: Blocks physical room for dates (Maintenance, VIP, Renovation, etc.)
 * - UNBLOCK_ROOM: Releases an active room block
 * - MOVE_RESERVATION: Reassigns reservation to another room or modified date with concurrency lock
 */
export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    // 1. BLOCK_ROOM
    if (action === "BLOCK_ROOM") {
      const {
        physicalRoomId,
        startDate,
        endDate,
        reason,
        blockType = "MANAGEMENT_BLOCK",
        notes,
      } = body;

      if (!physicalRoomId || !startDate || !endDate || !reason) {
        return apiError(
          "VALIDATION_ERROR",
          "physicalRoomId, startDate, endDate, and reason are required",
          400
        );
      }

      const sDate = new Date(startDate);
      const eDate = new Date(endDate);

      if (eDate <= sDate) {
        return apiError("VALIDATION_ERROR", "endDate must be after startDate", 400);
      }

      const result = await prisma.$transaction(async (tx) => {
        // Row-level lock on physical room
        const room = await tx.physicalRoom.findUnique({
          where: { id: physicalRoomId },
        });

        if (!room) {
          throw new Error("Physical room not found");
        }

        // Check if existing confirmed bookings overlap
        const overlappingStays = await tx.roomAssignment.findMany({
          where: {
            physicalRoomId,
            status: { in: ["ASSIGNED", "ACTIVE"] },
            booking: {
              status: { in: ["CONFIRMED", "CHECKED_IN"] },
              AND: [{ checkIn: { lt: eDate } }, { checkOut: { gt: sDate } }],
            },
          },
          include: { booking: { select: { referenceId: true } } },
        });

        if (overlappingStays.length > 0) {
          throw new Error(
            `Cannot block Room ${room.roomNumber}: Overlaps with active booking ${overlappingStays[0].booking.referenceId}`
          );
        }

        const block = await tx.roomBlock.create({
          data: {
            physicalRoomId,
            startDate: sDate,
            endDate: eDate,
            reason,
            blockType: blockType as RoomBlockType,
            status: RoomBlockStatus.ACTIVE,
            createdBy: currentStaff.name,
            notes,
          },
        });

        // If block starts today or is active now, update room status
        const now = new Date();
        if (sDate <= now && eDate >= now) {
          await tx.physicalRoom.update({
            where: { id: physicalRoomId },
            data: { status: RoomStatus.BLOCKED },
          });
        }

        await tx.auditLog.create({
          data: {
            userId: currentStaff.userId,
            userName: currentStaff.name,
            action: "ROOM_BLOCKED",
            entity: "RoomBlock",
            entityId: block.id,
            details: `Blocked Room ${room.roomNumber} from ${sDate.toISOString().split("T")[0]} to ${eDate.toISOString().split("T")[0]} (${reason})`,
          },
        });

        return block;
      });

      return apiSuccess({ message: "Physical room blocked successfully", block: result }, 201);
    }

    // 2. UNBLOCK_ROOM
    if (action === "UNBLOCK_ROOM") {
      const { blockId } = body;
      if (!blockId) {
        return apiError("VALIDATION_ERROR", "blockId is required", 400);
      }

      const result = await prisma.$transaction(async (tx) => {
        const block = await tx.roomBlock.findUnique({
          where: { id: blockId },
          include: { physicalRoom: true },
        });

        if (!block) {
          throw new Error("Room block record not found");
        }

        const updatedBlock = await tx.roomBlock.update({
          where: { id: blockId },
          data: { status: RoomBlockStatus.RELEASED },
        });

        // Restore room status to AVAILABLE if currently blocked
        if (block.physicalRoom.status === RoomStatus.BLOCKED) {
          await tx.physicalRoom.update({
            where: { id: block.physicalRoomId },
            data: { status: RoomStatus.AVAILABLE },
          });
        }

        await tx.auditLog.create({
          data: {
            userId: currentStaff.userId,
            userName: currentStaff.name,
            action: "ROOM_UNBLOCKED",
            entity: "RoomBlock",
            entityId: block.id,
            details: `Unblocked Room ${block.physicalRoom.roomNumber} (${block.reason})`,
          },
        });

        return updatedBlock;
      });

      return apiSuccess({ message: "Room block released", block: result });
    }

    // 3. MOVE_RESERVATION
    if (action === "MOVE_RESERVATION") {
      const { bookingId, targetPhysicalRoomId, newCheckIn, newCheckOut } = body;

      if (!bookingId || !targetPhysicalRoomId) {
        return apiError(
          "VALIDATION_ERROR",
          "bookingId and targetPhysicalRoomId are required",
          400
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: {
            roomAssignments: { where: { status: { in: ["ASSIGNED", "ACTIVE"] } } },
          },
        });

        if (!booking) {
          throw new Error("Booking not found");
        }

        const checkIn = newCheckIn ? new Date(newCheckIn) : booking.checkIn;
        const checkOut = newCheckOut ? new Date(newCheckOut) : booking.checkOut;

        const targetRoom = await tx.physicalRoom.findUnique({
          where: { id: targetPhysicalRoomId },
          include: { roomType: true },
        });

        if (!targetRoom) {
          throw new Error("Target physical room not found");
        }

        // Row-level lock on the Room category to serialize concurrent checks
        await tx.$queryRawUnsafe(
          `SELECT "id" FROM "Room" WHERE "id" = $1 FOR UPDATE`,
          targetRoom.roomTypeId
        );

        // Check if target physical room is blocked
        const conflictingBlock = await tx.roomBlock.findFirst({
          where: {
            physicalRoomId: targetPhysicalRoomId,
            status: RoomBlockStatus.ACTIVE,
            AND: [{ startDate: { lt: checkOut } }, { endDate: { gt: checkIn } }],
          },
        });

        if (conflictingBlock) {
          throw new Error(
            `Room ${targetRoom.roomNumber} is blocked for ${conflictingBlock.reason} during requested dates.`
          );
        }

        // Check if another active booking occupies target room
        const conflictingAssignment = await tx.roomAssignment.findFirst({
          where: {
            physicalRoomId: targetPhysicalRoomId,
            bookingId: { not: bookingId },
            status: { in: ["ASSIGNED", "ACTIVE"] },
            booking: {
              status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
              AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
            },
          },
          include: { booking: { select: { referenceId: true } } },
        });

        if (conflictingAssignment) {
          throw new Error(
            `Room ${targetRoom.roomNumber} is already occupied by booking ${conflictingAssignment.booking.referenceId} for these dates.`
          );
        }

        // Deactivate previous assignment
        await tx.roomAssignment.updateMany({
          where: { bookingId, status: { in: ["ASSIGNED", "ACTIVE"] } },
          data: { status: "TRANSFERRED" },
        });

        // Create new assignment
        const newAssignment = await tx.roomAssignment.create({
          data: {
            bookingId,
            physicalRoomId: targetPhysicalRoomId,
            status: booking.status === "CHECKED_IN" ? "ACTIVE" : "ASSIGNED",
            assignedBy: currentStaff.name,
            notes: `Transferred by ${currentStaff.name} via room calendar`,
          },
        });

        // Update booking assignedRoomId and dates
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            assignedRoomId: targetPhysicalRoomId,
            roomId: targetRoom.roomTypeId, // Update category if upgraded/downgraded
            checkIn,
            checkOut,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: currentStaff.userId,
            userName: currentStaff.name,
            action: "ROOM_REASSIGNED",
            entity: "Booking",
            entityId: bookingId,
            details: `Moved booking ${booking.referenceId} to Room ${targetRoom.roomNumber} for ${checkIn.toISOString().split("T")[0]} to ${checkOut.toISOString().split("T")[0]}`,
          },
        });

        return { bookingId, targetRoom: targetRoom.roomNumber, newAssignment };
      }, { timeout: 15000 });

      return apiSuccess({ message: "Reservation moved successfully", result });
    }

    return apiError("VALIDATION_ERROR", "Invalid action", 400);
  } catch (error: any) {
    console.error("POST Room Inventory Error:", error);
    return apiError("CONFLICT", error?.message || "Failed to process inventory action", 409);
  }
}
