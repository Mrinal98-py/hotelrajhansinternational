import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { calculateNights } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("range") || "THIS_MONTH"; // TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH, LAST_MONTH, ALL, CUSTOM
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const roomTypeFilter = searchParams.get("roomType");

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    if (timeRange === "TODAY") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeRange === "YESTERDAY") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    } else if (timeRange === "THIS_WEEK") {
      const day = now.getDay() || 7;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeRange === "THIS_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeRange === "LAST_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (timeRange === "CUSTOM" && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(`${endDateParam}T23:59:59.999Z`);
    } else {
      // ALL
      startDate = new Date("2026-01-01");
      endDate = new Date();
    }

    // 1. Fetch Physical Rooms Inventory State
    const physicalRooms = await prisma.physicalRoom.findMany({
      include: { roomType: true },
    });

    const totalPhysicalRooms = physicalRooms.filter((r) => r.isActive).length;
    const availablePhysicalRooms = physicalRooms.filter(
      (r) => r.isActive && r.status === "AVAILABLE" && r.housekeepingStatus === "READY"
    ).length;
    const occupiedPhysicalRooms = physicalRooms.filter((r) => r.status === "OCCUPIED").length;
    const dirtyPhysicalRooms = physicalRooms.filter((r) => r.housekeepingStatus === "DIRTY").length;
    const maintenancePhysicalRooms = physicalRooms.filter(
      (r) => r.status === "MAINTENANCE" || r.status === "OUT_OF_ORDER"
    ).length;

    // 2. Fetch Bookings in Range
    const bookingWhere: any = {
      createdAt: { gte: startDate, lte: endDate },
    };
    if (roomTypeFilter && roomTypeFilter !== "ALL") {
      bookingWhere.room = { type: roomTypeFilter };
    }

    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
      include: {
        customer: true,
        room: true,
        payments: true,
        folio: { include: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Revenue & Financial Aggregations
    const confirmedBookings = bookings.filter(
      (b) => b.status === "CONFIRMED" || b.status === "CHECKED_IN" || b.status === "CHECKED_OUT"
    );

    let grossRevenue = 0;
    let totalTaxes = 0;
    let totalDiscounts = 0;
    let totalPaid = 0;
    let totalNights = 0;

    for (const b of confirmedBookings) {
      grossRevenue += b.totalAmount;
      totalTaxes += b.taxAmount;
      totalDiscounts += b.discountAmount;
      totalPaid += b.paidAmount;
      totalNights += calculateNights(b.checkIn, b.checkOut);
    }

    const netRevenue = grossRevenue + totalTaxes - totalDiscounts;
    const outstandingBalance = Math.max(0, netRevenue - totalPaid);

    // Fetch Refunds in Range
    const refunds = await prisma.refund.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "PROCESSED",
      },
    });
    const totalRefunds = refunds.reduce((sum, r) => sum + r.refundAmount, 0);

    // 4. Hotel Performance KPIs
    const totalBookingsCount = bookings.length;
    const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;
    const noShowCount = bookings.filter((b) => b.status === "NO_SHOW").length;

    const cancellationRate =
      totalBookingsCount > 0 ? Math.round((cancelledCount / totalBookingsCount) * 100 * 10) / 10 : 0;
    const noShowRate =
      totalBookingsCount > 0 ? Math.round((noShowCount / totalBookingsCount) * 100 * 10) / 10 : 0;

    const occupancyRate =
      totalPhysicalRooms > 0
        ? Math.round((occupiedPhysicalRooms / totalPhysicalRooms) * 100)
        : 0;

    // ADR = Total Room Revenue / Total Sold Room Nights
    const adr = totalNights > 0 ? Math.round(grossRevenue / totalNights) : 0;

    // RevPAR = Total Room Revenue / (Total Rooms * Days in Range)
    const daysInRange = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const revPar =
      totalPhysicalRooms > 0
        ? Math.round(grossRevenue / (totalPhysicalRooms * daysInRange))
        : 0;

    const averageLengthOfStay =
      confirmedBookings.length > 0
        ? Math.round((totalNights / confirmedBookings.length) * 10) / 10
        : 0;

    // 5. Payment Methods Breakdown
    const paymentMethodsMap: Record<string, number> = {
      UPI: 0,
      CARD: 0,
      CASH: 0,
      NETBANKING: 0,
    };

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "SUCCESS",
      },
    });

    for (const p of payments) {
      const m = p.method || "UPI";
      paymentMethodsMap[m] = (paymentMethodsMap[m] || 0) + p.amount;
    }

    // 6. Today's Movements
    const todayStr = now.toISOString().split("T")[0];
    const todaysCheckIns = bookings.filter((b) => {
      const d = new Date(b.checkIn).toISOString().split("T")[0];
      return d === todayStr && b.status !== "CANCELLED";
    });

    const todaysCheckOuts = bookings.filter((b) => {
      const d = new Date(b.checkOut).toISOString().split("T")[0];
      return d === todayStr && b.status !== "CANCELLED";
    });

    // 7. Monthly Trend (last 6 months)
    const monthlyMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("en-IN", { month: "short", year: "numeric" });
      monthlyMap[label] = 0;
    }

    const allConfirmedHistoric = await prisma.booking.findMany({
      where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
      select: { createdAt: true, paidAmount: true },
    });

    for (const b of allConfirmedHistoric) {
      const label = new Date(b.createdAt).toLocaleString("en-IN", { month: "short", year: "numeric" });
      if (monthlyMap[label] !== undefined) {
        monthlyMap[label] += b.paidAmount;
      }
    }

    const revenueTrend = Object.entries(monthlyMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return apiSuccess({
      timeRange,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      kpis: {
        occupancyRate,
        adr,
        revPar,
        averageLengthOfStay,
        cancellationRate,
        noShowRate,
      },
      financials: {
        grossRevenue,
        netRevenue,
        totalTaxes,
        totalDiscounts,
        totalPaid,
        totalRefunds,
        outstandingBalance,
        paymentMethods: paymentMethodsMap,
      },
      inventory: {
        totalPhysicalRooms,
        availablePhysicalRooms,
        occupiedPhysicalRooms,
        dirtyPhysicalRooms,
        maintenancePhysicalRooms,
      },
      operations: {
        todaysBookingsCount: bookings.filter(
          (b) => new Date(b.createdAt).toISOString().split("T")[0] === todayStr
        ).length,
        todaysCheckInsCount: todaysCheckIns.length,
        todaysCheckOutsCount: todaysCheckOuts.length,
      },
      metrics: {
        totalRevenue: netRevenue,
        pendingPayments: outstandingBalance,
        totalBookings: bookings.length,
        occupancyRate,
        totalRooms: totalPhysicalRooms,
        occupiedRooms: occupiedPhysicalRooms,
        availableRooms: availablePhysicalRooms,
        todaysCheckInsCount: todaysCheckIns.length,
        todaysCheckOutsCount: todaysCheckOuts.length,
        todaysRevenue: bookings
          .filter((b) => new Date(b.createdAt).toISOString().split("T")[0] === todayStr && b.status !== "CANCELLED")
          .reduce((sum, b) => sum + b.paidAmount, 0),
      },
      revenueTrend,
      recentBookings: bookings.slice(0, 10),
    });
  } catch (error: any) {
    console.error("GET Reports Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to generate report", 500);
  }
}
