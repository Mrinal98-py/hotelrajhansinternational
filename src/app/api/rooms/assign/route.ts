import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { AssignmentStatus, RoomStatus } from "@prisma/client";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const { bookingId, physicalRoomId, notes } = body;

    if (!bookingId || !physicalRoomId) {
      return apiError("VALIDATION_ERROR", "bookingId and physicalRoomId are required", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { roomAssignments: { where: { status: { in: ["ASSIGNED", "ACTIVE"] } } } },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      const targetPhysicalRoom = await tx.physicalRoom.findUnique({
        where: { id: physicalRoomId },
        include: { roomType: true },
      });

      if (!targetPhysicalRoom) {
        throw new Error("Target physical room not found");
      }

      if (
        targetPhysicalRoom.status === RoomStatus.MAINTENANCE ||
        targetPhysicalRoom.status === RoomStatus.OUT_OF_ORDER ||
        targetPhysicalRoom.status === RoomStatus.DEACTIVATED
      ) {
        throw new Error(`Room ${targetPhysicalRoom.roomNumber} is currently under maintenance or out of order`);
      }

      // Check overlapping active stays on target room
      const overlapping = await tx.roomAssignment.findFirst({
        where: {
          physicalRoomId,
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
        throw new Error(`Room ${targetPhysicalRoom.roomNumber} is already assigned to another stay during this date period.`);
      }

      // Mark existing active assignments as TRANSFERRED
      await tx.roomAssignment.updateMany({
        where: {
          bookingId,
          status: { in: ["ASSIGNED", "ACTIVE"] },
        },
        data: {
          status: AssignmentStatus.TRANSFERRED,
        },
      });

      // Create new assignment
      const newStatus =
        booking.status === "CHECKED_IN" ? AssignmentStatus.ACTIVE : AssignmentStatus.ASSIGNED;

      const assignment = await tx.roomAssignment.create({
        data: {
          bookingId,
          physicalRoomId,
          assignedBy: currentStaff.name,
          status: newStatus,
          notes: notes || "Assigned by front desk",
        },
      });

      // Update booking pointer
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          assignedRoomId: physicalRoomId,
        },
      });

      // If checked in, ensure target room is OCCUPIED
      if (booking.status === "CHECKED_IN") {
        await tx.physicalRoom.update({
          where: { id: physicalRoomId },
          data: { status: RoomStatus.OCCUPIED },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "ROOM_ASSIGNMENT_CHANGE",
          entity: "Booking",
          entityId: bookingId,
          details: `Assigned room ${targetPhysicalRoom.roomNumber} to booking ${booking.referenceId}`,
        },
      });

      return { assignment, physicalRoom: targetPhysicalRoom };
    });

    return apiSuccess({
      message: `Room ${result.physicalRoom.roomNumber} successfully assigned`,
      assignment: result.assignment,
    });
  } catch (error: any) {
    console.error("Assign Room Error:", error);
    return apiError("CONFLICT", error?.message || "Failed to assign room", 400);
  }
}
