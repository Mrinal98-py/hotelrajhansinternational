import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateNights, generateBookingReference, isDateOverlap } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { referenceId: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { customer: { email: { contains: search } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        room: {
          include: { images: true },
        },
        payments: true,
      },
    });

    return NextResponse.json(
      { success: true, bookings },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Bookings Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      checkIn,
      checkOut,
      guests,
      adults = 2,
      children = 0,
      roomType,
      roomId,
      name,
      phone,
      email,
      specialRequests,
      address,
    } = body;

    if (!checkIn || !checkOut || !name || !phone) {
      return NextResponse.json(
        { error: "Check-in date, check-out date, name, and phone are required." },
        { status: 400 }
      );
    }

    // 1. Locate Room
    let room;
    if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
    } else if (roomType) {
      const typeEnum = roomType.toUpperCase();
      room = await prisma.room.findFirst({
        where: { OR: [{ type: typeEnum as any }, { slug: roomType }] },
      });
    }

    if (!room) {
      room = await prisma.room.findFirst({ where: { status: "AVAILABLE" } });
    }

    if (!room) {
      return NextResponse.json({ error: "Selected room is currently unavailable." }, { status: 400 });
    }

    if (room.status === "DEACTIVATED") {
      return NextResponse.json(
        { error: "Selected room category is deactivated and not available for booking." },
        { status: 400 }
      );
    }

    if (room.status === "OCCUPIED") {
      return NextResponse.json(
        { error: "Selected room is currently occupied. Please choose an available room or contact reception." },
        { status: 400 }
      );
    }

    if (room.status === "MAINTENANCE") {
      return NextResponse.json(
        { error: "Selected room is currently undergoing maintenance and unavailable for reservation." },
        { status: 400 }
      );
    }

    // 2. Check Overlapping Bookings & Clean Up Expired Pending Reservations
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = calculateNights(checkInDate, checkOutDate);
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Auto-cancel abandoned PENDING bookings older than 30 mins
    try {
      await prisma.booking.updateMany({
        where: {
          status: "PENDING",
          createdAt: { lt: thirtyMinsAgo },
        },
        data: { status: "CANCELLED" },
      });
    } catch (e) {
      console.warn("Expired PENDING cleanup notice:", e);
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        roomId: room.id,
        status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
      },
      include: { customer: true },
    });

    const cleanPhone = phone.trim();

    // Allow user to retry/continue their own recent PENDING booking session
    const sameCustomerPending = existingBookings.find(
      (b) => b.status === "PENDING" && b.customer?.phone === cleanPhone
    );

    if (sameCustomerPending) {
      return NextResponse.json({
        success: true,
        booking: {
          id: sameCustomerPending.id,
          referenceId: sameCustomerPending.referenceId,
          customerName: name.trim(),
          customerPhone: cleanPhone,
          customerEmail: email ? email.trim() : sameCustomerPending.customer?.email,
          roomName: room.name,
          checkIn: sameCustomerPending.checkIn,
          checkOut: sameCustomerPending.checkOut,
          nights,
          totalAmount: sameCustomerPending.totalAmount,
          taxAmount: sameCustomerPending.taxAmount,
          netAmount: sameCustomerPending.netAmount,
          status: sameCustomerPending.status,
        },
      });
    }

    const hasConfirmedOverlap = existingBookings.some(
      (b) =>
        (b.status === "CONFIRMED" || b.status === "CHECKED_IN") &&
        isDateOverlap(checkInDate, checkOutDate, b.checkIn, b.checkOut)
    );

    if (hasConfirmedOverlap) {
      return NextResponse.json(
        { error: "Selected dates are already booked for this room. Please select different dates." },
        { status: 409 }
      );
    }

    // 3. Find or Create Customer
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email ? email.trim() : null,
          address: address ? address.trim() : null,
          visitCount: 1,
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: name.trim(),
          email: email ? email.trim() : customer.email,
          address: address ? address.trim() : customer.address,
          visitCount: customer.visitCount + 1,
        },
      });
    }

    // 4. Price Calculations
    const numGuests = parseInt(guests || "2");
    const ratePerNight = numGuests > 1 ? room.basePriceDouble : room.basePriceSingle;
    const totalAmount = ratePerNight * nights;
    const taxAmount = (totalAmount * room.taxPercentage) / 100;
    const netAmount = totalAmount + taxAmount;

    // 5. Generate Reference ID
    const count = await prisma.booking.count();
    const referenceId = generateBookingReference(count + 1);

    // 6. Create Booking
    const booking = await prisma.booking.create({
      data: {
        referenceId,
        customerId: customer.id,
        roomId: room.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestsCount: numGuests,
        adults: parseInt(adults),
        children: parseInt(children),
        specialRequests,
        totalAmount,
        taxAmount,
        netAmount,
        paidAmount: 0,
        status: "PENDING",
      },
      include: {
        customer: true,
        room: true,
      },
    });

    // Invalidate public & admin caches
    revalidatePath("/", "layout");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        referenceId: booking.referenceId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        roomName: room.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights,
        totalAmount: booking.totalAmount,
        taxAmount: booking.taxAmount,
        netAmount: booking.netAmount,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
