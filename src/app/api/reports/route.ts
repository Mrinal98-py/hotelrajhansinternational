import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const todayStart = new Date(`${todayStr}T00:00:00.000Z`);
    const todayEnd = new Date(`${todayStr}T23:59:59.999Z`);

    // 1. Total & Available Rooms
    const totalRoomsCount = await prisma.room.count();
    const availableRoomsCount = await prisma.room.count({
      where: { status: "AVAILABLE" },
    });

    // 2. Bookings Metrics
    const allBookings = await prisma.booking.findMany({
      include: { customer: true, room: true, payments: true },
      orderBy: { createdAt: "desc" },
    });

    const confirmedBookings = allBookings.filter(
      (b) => b.status === "CONFIRMED" || b.status === "CHECKED_IN" || b.status === "CHECKED_OUT"
    );

    // 3. Financial Metrics
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.paidAmount, 0);
    const pendingPayments = allBookings
      .filter((b) => b.status === "PENDING" || b.netAmount > b.paidAmount)
      .reduce((sum, b) => sum + (b.netAmount - b.paidAmount), 0);

    // 4. Today's Movements
    const todaysCheckIns = allBookings.filter((b) => {
      const cDate = new Date(b.checkIn).toISOString().split("T")[0];
      return cDate === todayStr && b.status !== "CANCELLED";
    });

    const todaysCheckOuts = allBookings.filter((b) => {
      const cDate = new Date(b.checkOut).toISOString().split("T")[0];
      return cDate === todayStr && b.status !== "CANCELLED";
    });

    // 5. Occupancy Calculation
    const activeOccupiedCount = allBookings.filter(
      (b) => b.status === "CHECKED_IN" || (b.status === "CONFIRMED" && new Date(b.checkIn) <= todayEnd && new Date(b.checkOut) >= todayStart)
    ).length;

    const occupancyRate = totalRoomsCount > 0 ? Math.round((activeOccupiedCount / totalRoomsCount) * 100) : 0;

    // 6. Monthly Revenue Breakdown (Last 6 Months)
    const monthlyRevenueMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("en-IN", { month: "short", year: "numeric" });
      monthlyRevenueMap[label] = 0;
    }

    confirmedBookings.forEach((b) => {
      const label = new Date(b.createdAt).toLocaleString("en-IN", { month: "short", year: "numeric" });
      if (monthlyRevenueMap[label] !== undefined) {
        monthlyRevenueMap[label] += b.paidAmount;
      }
    });

    const revenueTrend = Object.entries(monthlyRevenueMap).map(([month, amount]) => ({
      month,
      revenue: amount,
    }));

    return NextResponse.json(
      {
        success: true,
        metrics: {
          totalRevenue,
          pendingPayments,
          occupancyRate,
          totalRooms: totalRoomsCount,
          availableRooms: availableRoomsCount,
          occupiedRooms: activeOccupiedCount,
          todaysBookingsCount: allBookings.filter((b) => {
            const cDate = new Date(b.createdAt).toISOString().split("T")[0];
            return cDate === todayStr;
          }).length,
          todaysCheckInsCount: todaysCheckIns.length,
          todaysCheckOutsCount: todaysCheckOuts.length,
        },
        revenueTrend,
        recentBookings: allBookings.slice(0, 10),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Reports Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
