import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { HousekeepingStatus, RoomStatus, TaskStatus, TaskPriority, TaskType } from "@prisma/client";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, [
      "SUPER_ADMIN",
      "MANAGER",
      "RECEPTION",
      "HOUSEKEEPING",
      "STAFF",
    ]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;

    const [tasks, rooms] = await Promise.all([
      prisma.housekeepingTask.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        include: {
          physicalRoom: {
            include: { roomType: true },
          },
        },
      }),
      prisma.physicalRoom.findMany({
        where: { isActive: true },
        orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
        include: { roomType: true },
      }),
    ]);

    // Calculate metrics
    const metrics = {
      totalRooms: rooms.length,
      readyRooms: rooms.filter((r) => r.housekeepingStatus === "READY").length,
      dirtyRooms: rooms.filter((r) => r.housekeepingStatus === "DIRTY").length,
      cleaningRooms: rooms.filter((r) => r.housekeepingStatus === "CLEANING").length,
      inspectionRooms: rooms.filter((r) => r.housekeepingStatus === "INSPECTION").length,
      pendingTasks: tasks.filter((t) => t.status === "PENDING").length,
    };

    return apiSuccess({ tasks, rooms, metrics });
  } catch (error: any) {
    console.error("GET Housekeeping Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch housekeeping data", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "HOUSEKEEPING", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const { action } = body; // 'CREATE_TASK', 'UPDATE_TASK', 'CHANGE_ROOM_STATUS'

    if (action === "CREATE_TASK") {
      const { physicalRoomId, taskType = "DAILY_CLEAN", priority = "MEDIUM", assignedTo, assignedToName, notes } = body;

      if (!physicalRoomId) {
        return apiError("VALIDATION_ERROR", "physicalRoomId is required", 400);
      }

      const task = await prisma.housekeepingTask.create({
        data: {
          physicalRoomId,
          taskType: taskType as TaskType,
          priority: priority as TaskPriority,
          status: TaskStatus.PENDING,
          assignedTo,
          assignedToName,
          notes,
        },
        include: { physicalRoom: true },
      });

      return apiSuccess({ message: "Housekeeping task created", task }, 201);
    }

    if (action === "UPDATE_TASK") {
      const { taskId, status, notes } = body;
      if (!taskId || !status) {
        return apiError("VALIDATION_ERROR", "taskId and status are required", 400);
      }

      const existing = await prisma.housekeepingTask.findUnique({
        where: { id: taskId },
        include: { physicalRoom: true },
      });

      if (!existing) {
        return apiError("NOT_FOUND", "Task not found", 404);
      }

      const now = new Date();
      const isStarting = status === "IN_PROGRESS" && !existing.startedAt;
      const isCompleting = status === "COMPLETED";

      const updatedTask = await prisma.housekeepingTask.update({
        where: { id: taskId },
        data: {
          status: status as TaskStatus,
          startedAt: isStarting ? now : undefined,
          completedAt: isCompleting ? now : undefined,
          inspectedBy: status === "INSPECTION" ? currentStaff.name : undefined,
          notes: notes ? `${existing.notes || ""}\n${notes}` : undefined,
        },
      });

      // Synchronize Physical Room status based on task progression
      if (status === "IN_PROGRESS") {
        await prisma.physicalRoom.update({
          where: { id: existing.physicalRoomId },
          data: { housekeepingStatus: HousekeepingStatus.CLEANING },
        });
      } else if (status === "INSPECTION") {
        await prisma.physicalRoom.update({
          where: { id: existing.physicalRoomId },
          data: { housekeepingStatus: HousekeepingStatus.INSPECTION },
        });
      } else if (status === "COMPLETED") {
        // Room becomes clean and READY. If not occupied, it becomes AVAILABLE!
        const room = await prisma.physicalRoom.findUnique({
          where: { id: existing.physicalRoomId },
        });

        await prisma.physicalRoom.update({
          where: { id: existing.physicalRoomId },
          data: {
            housekeepingStatus: HousekeepingStatus.READY,
            status: room?.status === RoomStatus.OCCUPIED ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE,
          },
        });
      }

      return apiSuccess({ message: "Housekeeping task updated", task: updatedTask });
    }

    if (action === "CHANGE_ROOM_STATUS") {
      const { physicalRoomId, housekeepingStatus, notes } = body;
      if (!physicalRoomId || !housekeepingStatus) {
        return apiError("VALIDATION_ERROR", "physicalRoomId and housekeepingStatus are required", 400);
      }

      const currentRoom = await prisma.physicalRoom.findUnique({
        where: { id: physicalRoomId },
      });

      if (!currentRoom) {
        return apiError("NOT_FOUND", "Room not found", 404);
      }

      // If set to READY and room was DIRTY, make it AVAILABLE
      const newStatus =
        housekeepingStatus === "READY" && currentRoom.status === RoomStatus.DIRTY
          ? RoomStatus.AVAILABLE
          : currentRoom.status;

      const updatedRoom = await prisma.physicalRoom.update({
        where: { id: physicalRoomId },
        data: {
          housekeepingStatus: housekeepingStatus as HousekeepingStatus,
          status: newStatus,
          notes: notes || currentRoom.notes,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "HOUSEKEEPING_STATUS_CHANGED",
          entity: "PhysicalRoom",
          entityId: physicalRoomId,
          details: `Changed room ${currentRoom.roomNumber} housekeeping status to ${housekeepingStatus}`,
        },
      });

      return apiSuccess({ message: "Room housekeeping status updated", room: updatedRoom });
    }

    return apiError("VALIDATION_ERROR", "Invalid action", 400);
  } catch (error: any) {
    console.error("POST Housekeeping Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to update housekeeping", 500);
  }
}
