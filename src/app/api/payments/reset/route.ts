import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 1. Clear payment transaction logs
    const deletedPayments = await prisma.payment.deleteMany();

    // 2. Reset booking paid amounts
    await prisma.booking.updateMany({
      data: {
        paidAmount: 0,
        status: "PENDING",
      },
    });

    // 3. Reset customer CRM total spent
    await prisma.customer.updateMany({
      data: {
        totalSpent: 0,
      },
    });

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "RESET_PAYMENT_METRICS",
        entity: "Payment",
        details: `Reset ${deletedPayments.count} payment logs and financial metrics`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "All payment records and financial metrics have been reset successfully.",
    });
  } catch (error) {
    console.error("POST Reset Payments Error:", error);
    return NextResponse.json({ error: "Failed to reset payments" }, { status: 500 });
  }
}
