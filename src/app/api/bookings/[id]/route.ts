import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
        customer: true,
        room: { include: { images: true } },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, booking },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Booking Single Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paidAmount, specialRequests, notes } = body;

    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: status || existing.status,
        paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : existing.paidAmount,
        specialRequests: specialRequests !== undefined ? specialRequests : existing.specialRequests,
      },
      include: { customer: true, room: true, payments: true },
    });

    // Update customer total spent if status completed/checked-out
    if (status === "CHECKED_OUT") {
      await prisma.customer.update({
        where: { id: existing.customerId },
        data: {
          totalSpent: { increment: updated.netAmount },
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE_BOOKING_STATUS",
        entity: "Booking",
        entityId: id,
        details: `Updated booking ${existing.referenceId} status to ${status}`,
      },
    });

    // Invalidate public & admin caches
    revalidatePath("/", "layout");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");
    revalidatePath("/admin/customers");

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("PUT Booking Error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
