import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { MaintenanceStatus, RoomStatus, TicketPriority, TicketStatus } from "@prisma/client";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, [
      "SUPER_ADMIN",
      "MANAGER",
      "RECEPTION",
      "MAINTENANCE",
      "STAFF",
    ]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;
    if (category && category !== "ALL") where.category = category;

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        physicalRoom: {
          include: { roomType: true },
        },
      },
    });

    const metrics = {
      totalTickets: tickets.length,
      openTickets: tickets.filter((t) => t.status === "OPEN" || t.status === "ASSIGNED").length,
      inProgressTickets: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      criticalTickets: tickets.filter((t) => t.priority === "CRITICAL" && t.status !== "CLOSED").length,
      blockingRooms: tickets.filter((t) => t.blocksRoom && t.status !== "CLOSED").length,
    };

    return apiSuccess({ tickets, metrics });
  } catch (error: any) {
    console.error("GET Maintenance Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch maintenance tickets", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "MAINTENANCE", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const { action } = body; // 'CREATE_TICKET', 'UPDATE_TICKET'

    if (action === "CREATE_TICKET") {
      const {
        title,
        description,
        category = "OTHER",
        priority = "MEDIUM",
        physicalRoomId,
        blocksRoom = false,
        assignedTo,
        estimatedCost,
        notes,
      } = body;

      if (!title || !description) {
        return apiError("VALIDATION_ERROR", "Title and description are required", 400);
      }

      const shouldBlock = blocksRoom || priority === "CRITICAL";

      const ticket = await prisma.$transaction(async (tx) => {
        const newTicket = await tx.maintenanceTicket.create({
          data: {
            title,
            description,
            category,
            priority: priority as TicketPriority,
            status: TicketStatus.OPEN,
            physicalRoomId: physicalRoomId || null,
            blocksRoom: shouldBlock,
            assignedTo,
            estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
            reportedBy: currentStaff.name,
            notes,
          },
          include: { physicalRoom: true },
        });

        // If ticket blocks room, set Physical Room status -> MAINTENANCE
        if (physicalRoomId && shouldBlock) {
          await tx.physicalRoom.update({
            where: { id: physicalRoomId },
            data: {
              status: RoomStatus.MAINTENANCE,
              maintenanceStatus: MaintenanceStatus.OUT_OF_ORDER,
            },
          });
        }

        await tx.auditLog.create({
          data: {
            userId: currentStaff.userId,
            userName: currentStaff.name,
            action: "MAINTENANCE_TICKET_CREATED",
            entity: "MaintenanceTicket",
            entityId: newTicket.id,
            details: `Created maintenance ticket: ${title} (Priority: ${priority}, Blocks Room: ${shouldBlock})`,
          },
        });

        return newTicket;
      });

      return apiSuccess({ message: "Maintenance ticket created", ticket }, 201);
    }

    if (action === "UPDATE_TICKET") {
      const { ticketId, status, actualCost, assignedTo, notes } = body;
      if (!ticketId || !status) {
        return apiError("VALIDATION_ERROR", "ticketId and status are required", 400);
      }

      const existing = await prisma.maintenanceTicket.findUnique({
        where: { id: ticketId },
      });

      if (!existing) {
        return apiError("NOT_FOUND", "Ticket not found", 404);
      }

      const isResolving = status === "RESOLVED" || status === "CLOSED";

      const updated = await prisma.$transaction(async (tx) => {
        const ticketUpdate = await tx.maintenanceTicket.update({
          where: { id: ticketId },
          data: {
            status: status as TicketStatus,
            assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
            actualCost: actualCost !== undefined ? parseFloat(actualCost) : existing.actualCost,
            resolvedAt: isResolving ? new Date() : undefined,
            notes: notes ? `${existing.notes || ""}\n${notes}` : undefined,
          },
        });

        // If ticket is resolved and was blocking the room, check if any other open blocking tickets exist
        if (existing.physicalRoomId && existing.blocksRoom && isResolving) {
          const otherBlocking = await tx.maintenanceTicket.findFirst({
            where: {
              physicalRoomId: existing.physicalRoomId,
              id: { not: existing.id },
              blocksRoom: true,
              status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] },
            },
          });

          if (!otherBlocking) {
            // Restore room to AVAILABLE and maintenanceStatus to NONE
            await tx.physicalRoom.update({
              where: { id: existing.physicalRoomId },
              data: {
                status: RoomStatus.AVAILABLE,
                maintenanceStatus: MaintenanceStatus.NONE,
              },
            });
          }
        }

        await tx.auditLog.create({
          data: {
            userId: currentStaff.userId,
            userName: currentStaff.name,
            action: `MAINTENANCE_TICKET_${status}`,
            entity: "MaintenanceTicket",
            entityId: ticketId,
            details: `Updated ticket ${existing.title} to ${status}`,
          },
        });

        return ticketUpdate;
      });

      return apiSuccess({ message: "Maintenance ticket updated", ticket: updated });
    }

    return apiError("VALIDATION_ERROR", "Invalid action", 400);
  } catch (error: any) {
    console.error("POST Maintenance Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to update maintenance", 500);
  }
}
