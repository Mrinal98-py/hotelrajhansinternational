import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailablePhysicalRooms } from "@/lib/inventory";
import { calculateBookingPricing } from "@/lib/pricing";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { roomId, roomType, checkIn, checkOut, adults = 2, children = 0, couponCode } = await request.json();

    if ((!roomId && !roomType) || !checkIn || !checkOut) {
      return NextResponse.json(
        { available: false, error: "Missing required fields (room/dates)" },
        { status: 400 }
      );
    }

    // Find room type by ID or type
    let room;
    if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
    } else if (roomType) {
      const typeEnum = roomType.toUpperCase();
      room = await prisma.room.findFirst({
        where: {
          OR: [{ type: typeEnum as any }, { slug: roomType }],
        },
      });
    }

    if (!room) {
      return NextResponse.json(
        { available: false, error: "Room category not found" },
        { status: 404 }
      );
    }

    if (room.status === "DEACTIVATED") {
      return NextResponse.json({
        available: false,
        reason: "Selected room category is deactivated.",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return NextResponse.json(
        { available: false, error: "Invalid date range provided" },
        { status: 400 }
      );
    }

    // Real Physical Room Availability Check
    const availableRooms = await getAvailablePhysicalRooms(room.id, checkInDate, checkOutDate);

    if (availableRooms.length === 0) {
      return NextResponse.json({
        available: false,
        reason: "No physical rooms available in this category for the selected dates.",
        availableCount: 0,
      });
    }

    // Dynamic Pricing Calculation
    const pricing = await calculateBookingPricing({
      roomTypeId: room.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: parseInt(adults, 10),
      children: parseInt(children, 10),
      couponCode,
    });

    return NextResponse.json({
      available: true,
      availableCount: availableRooms.length,
      availableRooms: availableRooms.map((r) => ({
        id: r.id,
        roomNumber: r.roomNumber,
        floor: r.floor,
        housekeepingStatus: r.housekeepingStatus,
      })),
      room: {
        id: room.id,
        name: room.name,
        type: room.type,
        basePriceSingle: room.basePriceSingle,
        basePriceDouble: room.basePriceDouble,
        taxPercentage: room.taxPercentage,
      },
      pricing: {
        nights: pricing.nights,
        ratePerNight: pricing.ratePerNight,
        baseAmount: pricing.baseAmount,
        discountAmount: pricing.discountAmount,
        discountCode: pricing.discountCode,
        taxAmount: pricing.taxAmount,
        netAmount: pricing.netAmount,
        breakdown: pricing.nightlyBreakdown,
      },
    });
  } catch (error: any) {
    console.error("Check Availability Error:", error);
    return NextResponse.json(
      { available: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
