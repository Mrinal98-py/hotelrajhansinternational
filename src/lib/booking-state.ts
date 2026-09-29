import { prisma } from "@/lib/prisma";
import { BookingStatus, RoomStatus, HousekeepingStatus, AssignmentStatus, TaskType, TaskPriority, TaskStatus, FolioItemType } from "@prisma/client";
import { addFolioItem, getOrCreateFolio } from "@/lib/folio";
import { queueOutboxEvent } from "@/lib/outbox";
import { allocatePhysicalRoomAtomic } from "@/lib/inventory";

export interface StateTransitionResult {
  success: boolean;
  previousStatus: BookingStatus;
  newStatus: BookingStatus;
  bookingId: string;
  message: string;
}

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  CONFIRMED: [BookingStatus.CHECKED_IN, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
  CHECKED_IN: [BookingStatus.CHECKED_OUT],
  CHECKED_OUT: [], // Terminal
  CANCELLED: [BookingStatus.CONFIRMED, BookingStatus.REFUNDED],
  NO_SHOW: [BookingStatus.CONFIRMED, BookingStatus.REFUNDED],
  REFUNDED: [], // Terminal
};

export function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Executes a transactional state change for a booking with full operational side effects:
 * - Room status updates
 * - Room assignment lifecycle
 * - Housekeeping cleaning task auto-generation on checkout
 * - Folio balance audit
 * - Transactional outbox event enqueue
 */
export async function transitionBookingStatus(params: {
  bookingId: string;
  targetStatus: BookingStatus;
  userId?: string;
  userName?: string;
  userRole?: string;
  reason?: string;
  bypassBalanceCheck?: boolean;
}): Promise<StateTransitionResult> {
  const { bookingId, targetStatus, userId, userName = "Staff", userRole, reason, bypassBalanceCheck } = params;

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        room: true,
        folio: true,
        roomAssignments: { where: { status: { in: ["ASSIGNED", "ACTIVE"] } } },
      },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const currentStatus = booking.status;

    if (currentStatus === targetStatus) {
      return {
        success: true,
        previousStatus: currentStatus,
        newStatus: targetStatus,
        bookingId,
        message: `Booking is already in status ${targetStatus}`,
      };
    }

    const isManager = userRole === "MANAGER" || userRole === "SUPER_ADMIN";

    if (!isValidTransition(currentStatus, targetStatus) && !(isManager && targetStatus === BookingStatus.CONFIRMED)) {
      throw new Error(
        `Invalid status transition: Cannot change booking from ${currentStatus} to ${targetStatus}`
      );
    }

    let assignedRoomId = booking.assignedRoomId;
    const now = new Date();

    // 0. Specific Confirmation / Reservation Logic (Direct manager reservation)
    if (targetStatus === BookingStatus.CONFIRMED) {
      if (!assignedRoomId) {
        try {
          assignedRoomId = await allocatePhysicalRoomAtomic(
            booking.id,
            booking.roomId,
            booking.checkIn,
            booking.checkOut,
            undefined,
            userName || "Manager Reservation",
            tx
          );
        } catch (allocErr: any) {
          throw new Error(`Cannot reserve booking: ${allocErr.message || "No rooms available for dates"}`);
        }
      } else {
        await tx.roomAssignment.updateMany({
          where: { bookingId, physicalRoomId: assignedRoomId, status: { not: "ASSIGNED" } },
          data: { status: AssignmentStatus.ASSIGNED },
        });
      }
    }

    // 1. Specific Check-In Logic
    if (targetStatus === BookingStatus.CHECKED_IN) {
      if (!assignedRoomId) {
        throw new Error("Cannot check in: No physical room assigned to this booking yet. Please assign a room first.");
      }

      // Check physical room readiness
      const physicalRoom = await tx.physicalRoom.findUnique({
        where: { id: assignedRoomId },
      });

      if (!physicalRoom) {
        throw new Error("Assigned physical room not found");
      }

      if (physicalRoom.status === RoomStatus.OCCUPIED) {
        throw new Error(`Room ${physicalRoom.roomNumber} is currently occupied by another guest`);
      }

      // Update Physical Room -> OCCUPIED
      await tx.physicalRoom.update({
        where: { id: assignedRoomId },
        data: {
          status: RoomStatus.OCCUPIED,
        },
      });

      // Update Room Assignment -> ACTIVE with checkInTime
      await tx.roomAssignment.updateMany({
        where: { bookingId, physicalRoomId: assignedRoomId, status: "ASSIGNED" },
        data: {
          status: AssignmentStatus.ACTIVE,
          checkInTime: now,
        },
      });

      // Enqueue Check-In Outbox Event
      await queueOutboxEvent(
        "CHECK_IN",
        {
          bookingId: booking.id,
          referenceId: booking.referenceId,
          guestName: booking.customer.name,
          roomNumber: physicalRoom.roomNumber,
          checkedInAt: now.toISOString(),
        },
        tx
      );
    }

    // 2. Specific Check-Out Logic
    if (targetStatus === BookingStatus.CHECKED_OUT) {
      // Folio balance check: must not leave unresolved financial balance unless bypass authorized
      const folio = await getOrCreateFolio(bookingId, tx);
      if (folio.balanceAmount > 0 && !bypassBalanceCheck) {
        throw new Error(
          `Cannot check out: Outstanding balance of ₹${folio.balanceAmount}. Settle folio balance or request supervisor bypass.`
        );
      }

      if (assignedRoomId) {
        // Physical Room -> DIRTY, HousekeepingStatus -> DIRTY
        const physicalRoom = await tx.physicalRoom.update({
          where: { id: assignedRoomId },
          data: {
            status: RoomStatus.DIRTY,
            housekeepingStatus: HousekeepingStatus.DIRTY,
          },
        });

        // Room Assignment -> COMPLETED with checkOutTime
        await tx.roomAssignment.updateMany({
          where: { bookingId, physicalRoomId: assignedRoomId, status: "ACTIVE" },
          data: {
            status: AssignmentStatus.COMPLETED,
            checkOutTime: now,
          },
        });

        // Automatically create HousekeepingTask for cleaning
        await tx.housekeepingTask.create({
          data: {
            physicalRoomId: assignedRoomId,
            taskType: TaskType.CHECKOUT_CLEAN,
            priority: TaskPriority.HIGH,
            status: TaskStatus.PENDING,
            notes: `Checkout cleaning for room ${physicalRoom.roomNumber} (Booking ${booking.referenceId})`,
          },
        });
      }

      // Update Customer CRM lifetime spend
      await tx.customer.update({
        where: { id: booking.customerId },
        data: {
          totalSpent: { increment: booking.paidAmount },
        },
      });

      // Enqueue Check-Out Outbox Event
      await queueOutboxEvent(
        "CHECK_OUT",
        {
          bookingId: booking.id,
          referenceId: booking.referenceId,
          guestName: booking.customer.name,
          checkedOutAt: now.toISOString(),
        },
        tx
      );
    }

    // 3. Specific Cancellation Logic
    if (targetStatus === BookingStatus.CANCELLED) {
      if (assignedRoomId) {
        // Release physical room back to AVAILABLE / READY if it was reserved
        await tx.physicalRoom.update({
          where: { id: assignedRoomId },
          data: {
            status: RoomStatus.AVAILABLE,
          },
        });

        await tx.roomAssignment.updateMany({
          where: { bookingId, physicalRoomId: assignedRoomId },
          data: { status: AssignmentStatus.CANCELLED },
        });
      }

      // Record cancellation policy calculation
      const policy = await tx.cancellationPolicy.findFirst({
        where: { isActive: true },
        orderBy: { hoursBeforeCheckIn: "desc" },
      });

      const hoursUntilCheckIn =
        (new Date(booking.checkIn).getTime() - Date.now()) / (1000 * 60 * 60);

      let refundAmount = 0;
      let feeAmount = 0;

      if (policy && hoursUntilCheckIn >= policy.hoursBeforeCheckIn) {
        refundAmount = (booking.paidAmount * policy.refundPercentage) / 100;
        feeAmount = booking.paidAmount - refundAmount;
      } else {
        // Late cancellation fee
        feeAmount = booking.paidAmount;
        refundAmount = 0;
      }

      await tx.bookingCancellation.upsert({
        where: { bookingId },
        update: {
          cancelledBy: userName,
          reason: reason || "Guest requested cancellation",
          policyApplied: policy?.name || "Standard Policy",
          feeAmount,
          refundAmount,
          status: refundAmount > 0 ? "PENDING" : "COMPLETED",
        },
        create: {
          bookingId,
          cancelledBy: userName,
          reason: reason || "Guest requested cancellation",
          policyApplied: policy?.name || "Standard Policy",
          feeAmount,
          refundAmount,
          status: refundAmount > 0 ? "PENDING" : "COMPLETED",
        },
      });

      // Post cancellation fee adjustment to Folio if folio exists
      const folio = await getOrCreateFolio(bookingId, tx);
      if (feeAmount > 0) {
        await addFolioItem(
          {
            folioId: folio.id,
            itemType: FolioItemType.ADJUSTMENT,
            description: `Cancellation Fee (${policy?.name || "Late Cancellation"})`,
            unitPrice: feeAmount,
            postedBy: userName,
          },
          tx
        );
      }

      // Enqueue Outbox Event
      await queueOutboxEvent(
        "BOOKING_CANCELLED",
        {
          bookingId: booking.id,
          referenceId: booking.referenceId,
          refundAmount,
          feeAmount,
          reason,
        },
        tx
      );
    }

    // 4. Specific No-Show Logic
    if (targetStatus === BookingStatus.NO_SHOW) {
      if (assignedRoomId) {
        await tx.physicalRoom.update({
          where: { id: assignedRoomId },
          data: { status: RoomStatus.AVAILABLE },
        });

        await tx.roomAssignment.updateMany({
          where: { bookingId, physicalRoomId: assignedRoomId },
          data: { status: AssignmentStatus.CANCELLED },
        });
      }

      // Post No-Show fee to folio
      const folio = await getOrCreateFolio(bookingId, tx);
      await addFolioItem(
        {
          folioId: folio.id,
          itemType: FolioItemType.ADJUSTMENT,
          description: "No-Show Retention Fee",
          unitPrice: booking.paidAmount,
          postedBy: userName,
        },
        tx
      );
    }

    // 5. Update Master Booking Status & Timestamps
    const bookingUpdateData: any = { status: targetStatus };
    if (targetStatus === BookingStatus.CHECKED_IN) {
      bookingUpdateData.actualCheckInAt = now;
      if (!booking.scheduledCheckIn) bookingUpdateData.scheduledCheckIn = booking.checkIn;
      if (!booking.scheduledCheckOut) bookingUpdateData.scheduledCheckOut = booking.checkOut;
    } else if (targetStatus === BookingStatus.CHECKED_OUT) {
      bookingUpdateData.actualCheckOutAt = now;
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: bookingUpdateData,
    });

    // 6. Append Immutable Audit Log
    await tx.auditLog.create({
      data: {
        userId,
        userName,
        action: `BOOKING_TRANSITION_${targetStatus}`,
        entity: "Booking",
        entityId: bookingId,
        details: `Booking ${booking.referenceId} transitioned from ${currentStatus} to ${targetStatus}. Reason: ${reason || "Standard operational transition"}`,
      },
    });

    return {
      success: true,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      bookingId,
      message: `Booking successfully transitioned to ${targetStatus}`,
    };
  });
}
