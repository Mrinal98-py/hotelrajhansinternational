import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION", "HOUSEKEEPING", "MAINTENANCE"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const floor = searchParams.get("floor");
    const status = searchParams.get("status");
    const housekeeping = searchParams.get("housekeeping");

    const where: any = {};
    if (floor) where.floor = parseInt(floor, 10);
    if (status) where.status = status;
    if (housekeeping) where.housekeepingStatus = housekeeping;

    const physicalRooms = await prisma.physicalRoom.findMany({
      where,
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
      include: {
        roomType: true,
        assignments: {
          where: { status: { in: ["ASSIGNED", "ACTIVE"] } },
          include: {
            booking: {
              include: { customer: true },
            },
          },
        },
        housekeepingTasks: {
          where: { status: { in: ["PENDING", "IN_PROGRESS", "INSPECTION"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        maintenanceTickets: {
          where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return apiSuccess({ physicalRooms });
  } catch (error: any) {
    console.error("GET Room Inventory Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch room inventory", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER"]);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json().catch(() => ({}));
    const { id, roomNumber, floor = 1, roomTypeId, status, housekeepingStatus, notes, isActive = true } = body;

    if (!roomNumber || !roomTypeId) {
      return apiError("VALIDATION_ERROR", "Room number and room category ID are required", 400);
    }

    let room;
    if (id) {
      room = await prisma.physicalRoom.update({
        where: { id },
        data: {
          roomNumber,
          floor: parseInt(floor, 10),
          roomTypeId,
          status: status || undefined,
          housekeepingStatus: housekeepingStatus || undefined,
          notes,
          isActive,
        },
      });
    } else {
      room = await prisma.physicalRoom.create({
        data: {
          roomNumber,
          floor: parseInt(floor, 10),
          roomTypeId,
          status: status || "AVAILABLE",
          housekeepingStatus: housekeepingStatus || "READY",
          notes,
          isActive,
        },
      });
    }

    return apiSuccess({ room });
  } catch (error: any) {
    console.error("POST Physical Room Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to save physical room", 500);
  }
}
