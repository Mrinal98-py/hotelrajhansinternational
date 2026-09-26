import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            customer: true,
          },
        },
      },
    });

    const list = payments.map((p) => ({
      id: p.id,
      cashfreePaymentId: p.cashfreePaymentId,
      cashfreeOrderId: p.cashfreeOrderId,
      bookingRef: p.booking?.referenceId || "N/A",
      customerName: p.booking?.customer?.name || "Guest",
      method: p.method,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(
      { success: true, payments: list },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Admin Payments Error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
