import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { transitionBookingStatus } from "@/lib/booking-state";
import { apiError, apiSuccess } from "@/lib/security";

export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          include: { documents: true, preferences: true },
        },
        room: { include: { images: true } },
        payments: { orderBy: { createdAt: "desc" } },
        roomAssignments: {
          include: { physicalRoom: true },
          orderBy: { assignedAt: "desc" },
        },
        folio: {
          include: { items: { orderBy: { createdAt: "asc" } } },
        },
        guests: true,
        refunds: true,
        modifications: true,
        extensions: true,
        cancellation: true,
      },
    });

    if (!booking) {
      return apiError("NOT_FOUND", "Booking not found", 404);
    }

    return apiSuccess({ booking });
  } catch (error: any) {
    console.error("GET Booking Single Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Internal server error", 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return apiError("UNAUTHORIZED", "Unauthorized access", 401);
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, specialRequests, notes, reason, bypassBalanceCheck } = body;

    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!existing) {
      return apiError("NOT_FOUND", "Booking not found", 404);
    }

    // 1. If status transition is requested, validate and execute via state machine
    if (status) {
      const normalizedTarget = status.toUpperCase() === "RESERVED" ? "CONFIRMED" : status;
      if (normalizedTarget !== existing.status) {
        await transitionBookingStatus({
          bookingId: id,
          targetStatus: normalizedTarget as any,
          userId: session.userId,
          userName: session.name,
          userRole: session.role,
          reason: reason || notes || (status.toUpperCase() === "RESERVED" ? "Manager updated status to Reserved" : undefined),
          bypassBalanceCheck: Boolean(bypassBalanceCheck && (session.role === "SUPER_ADMIN" || session.role === "MANAGER")),
        });
      }
    }

    // 2. Update optional fields
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        specialRequests:
          specialRequests !== undefined ? specialRequests : existing.specialRequests,
      },
      include: {
        customer: true,
        room: true,
        payments: true,
        roomAssignments: { include: { physicalRoom: true } },
        folio: { include: { items: true } },
      },
    });

    // Invalidate caches
    revalidatePath("/", "layout");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");
    revalidatePath("/admin/customers");

    return apiSuccess({ booking: updated });
  } catch (error: any) {
    console.error("PUT Booking Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to update booking", 400);
  }
}
