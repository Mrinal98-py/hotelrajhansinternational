import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyInvoiceToken } from "@/lib/security";
import { generateInvoiceHTML } from "@/lib/invoice";

export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const session = await getSession(request);

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { referenceId: id }],
      },
      include: {
        customer: true,
        room: true,
        payments: true,
        folio: {
          include: { items: true },
        },
      },
    });

    if (!booking) {
      return new NextResponse("Invoice / Booking not found", { status: 404 });
    }

    // Security Gate: Either logged-in staff session OR valid cryptographic HMAC signature token
    const isAuthorizedStaff = Boolean(session);
    const isValidToken = token ? verifyInvoiceToken(booking.id, token) : false;

    if (!isAuthorizedStaff && !isValidToken) {
      return new NextResponse(
        "Unauthorized access: Invoices require admin session or secure signed guest token.",
        { status: 403 }
      );
    }

    const gstinSetting = await prisma.setting.findUnique({
      where: { key: "gstin" },
    });

    const payment = booking.payments.find((p) => p.status === "SUCCESS") || booking.payments[0];

    const html = generateInvoiceHTML({
      bookingReference: booking.referenceId,
      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      customerEmail: booking.customer.email,
      customerAddress: booking.customer.address,
      roomName: booking.room.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestsCount: booking.guestsCount,
      basePrice: booking.appliedRoomRate || booking.room.basePriceDouble,
      totalAmount: booking.folio?.totalCharges || booking.totalAmount,
      taxAmount: booking.folio?.totalTaxes || booking.taxAmount,
      discountAmount: booking.folio?.totalDiscounts || booking.discountAmount,
      netAmount: booking.folio ? booking.folio.totalCharges + booking.folio.totalTaxes - booking.folio.totalDiscounts : booking.netAmount,
      paidAmount: booking.folio?.totalPaid || booking.paidAmount,
      paymentStatus: payment?.status || (booking.paidAmount >= booking.netAmount ? "SUCCESS" : "PENDING"),
      paymentMethod: payment?.method || "UPI",
      gstin: gstinSetting?.value || "10AAAAA0000A1Z5",
      createdAt: booking.createdAt,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET Invoice Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
