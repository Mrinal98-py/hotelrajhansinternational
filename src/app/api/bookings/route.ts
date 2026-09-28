import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateSafeBookingReference } from "@/lib/sequence";
import { calculateBookingPricing } from "@/lib/pricing";
import { allocatePhysicalRoomAtomic, getAvailablePhysicalRooms } from "@/lib/inventory";
import { getOrCreateFolio } from "@/lib/folio";
import { apiError, apiSuccess } from "@/lib/security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return apiError("UNAUTHORIZED", "Unauthorized access", 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { referenceId: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where: whereClause }),
      prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: true,
          room: {
            include: { images: true },
          },
          payments: true,
          roomAssignments: {
            where: { status: { in: ["ASSIGNED", "ACTIVE"] } },
            include: { physicalRoom: true },
          },
          folio: true,
          guests: true,
        },
      }),
    ]);

    return apiSuccess({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET Bookings Error:", error);
    return apiError("DATABASE_ERROR", "Failed to fetch bookings", 500, error?.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      checkIn,
      checkOut,
      guests,
      adults = 2,
      children = 0,
      extraBeds = 0,
      roomType,
      roomId,
      preferredPhysicalRoomId,
      name,
      phone,
      email,
      specialRequests,
      address,
      city,
      state,
      couponCode,
      additionalGuests,
    } = body;

    if (!checkIn || !checkOut || !name || !phone) {
      return apiError(
        "VALIDATION_ERROR",
        "Check-in date, check-out date, guest name, and phone number are required.",
        400
      );
    }

    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanEmail = email ? email.trim() : null;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return apiError("VALIDATION_ERROR", "Invalid check-in or check-out date format.", 400);
    }

    if (checkOutDate <= checkInDate) {
      return apiError("VALIDATION_ERROR", "Check-out date must be strictly after check-in date.", 400);
    }

    // 1. Locate Room Category
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
      return apiError("INVENTORY_ERROR", "Selected room category is not found.", 404);
    }

    if (room.status === "DEACTIVATED") {
      return apiError("INVENTORY_ERROR", "Selected room category is deactivated.", 400);
    }

    // 2. Clean Up Abandoned PENDING bookings older than 30 mins
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
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

    // 3. Concurrency-Safe Physical Inventory Check
    const availableRooms = await getAvailablePhysicalRooms(
      room.id,
      checkInDate,
      checkOutDate
    );

    if (availableRooms.length === 0) {
      return apiError(
        "INVENTORY_ERROR",
        "No rooms available for the selected category and dates. Please select alternative dates.",
        409
      );
    }

    // 4. Calculate Tariff & Pricing Breakdown
    const pricing = await calculateBookingPricing({
      roomTypeId: room.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: parseInt(adults || "2", 10),
      children: parseInt(children || "0", 10),
      extraBeds: parseInt(extraBeds || "0", 10),
      couponCode,
    });

    // 5. Concurrency-Safe Sequence Reference Generation
    const referenceId = await generateSafeBookingReference();

    // 6. Execute Transactional Creation
    const result = await prisma.$transaction(async (tx) => {
      // Find or Upsert Customer
      let customer = await tx.customer.findUnique({
        where: { phone: cleanPhone },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            address: address ? address.trim() : null,
            city: city ? city.trim() : null,
            state: state ? state.trim() : null,
            visitCount: 1,
          },
        });
      } else {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: cleanName,
            email: cleanEmail || customer.email,
            address: address ? address.trim() : customer.address,
            city: city ? city.trim() : customer.city,
            state: state ? state.trim() : customer.state,
            visitCount: customer.visitCount + 1,
          },
        });
      }

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          referenceId,
          customerId: customer.id,
          roomId: room.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guestsCount: parseInt(guests || "2", 10),
          adults: parseInt(adults || "2", 10),
          children: parseInt(children || "0", 10),
          specialRequests,
          totalAmount: pricing.grossAmount,
          taxAmount: pricing.taxAmount,
          discountAmount: pricing.discountAmount,
          netAmount: pricing.netAmount,
          paidAmount: 0,
          appliedRoomRate: pricing.ratePerNight,
          appliedTaxRate: pricing.taxPercentage,
          appliedDiscount: pricing.discountAmount,
          pricingBreakdown: pricing.nightlyBreakdown as any,
          status: "PENDING",
        },
        include: {
          customer: true,
          room: true,
        },
      });

      // Atomically assign physical room
      const assignedPhysicalRoomId = await allocatePhysicalRoomAtomic(
        booking.id,
        room.id,
        checkInDate,
        checkOutDate,
        preferredPhysicalRoomId,
        "Online Booking Allocation",
        tx
      );

      // Create Primary Booking Guest
      await tx.bookingGuest.create({
        data: {
          bookingId: booking.id,
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          isPrimary: true,
        },
      });

      // Create Additional Guests if provided
      if (Array.isArray(additionalGuests)) {
        for (const guest of additionalGuests) {
          if (guest.name && guest.name.trim()) {
            await tx.bookingGuest.create({
              data: {
                bookingId: booking.id,
                name: guest.name.trim(),
                phone: guest.phone ? guest.phone.trim() : null,
                email: guest.email ? guest.email.trim() : null,
                age: guest.age ? parseInt(guest.age, 10) : null,
                gender: guest.gender || null,
                isPrimary: false,
              },
            });
          }
        }
      }

      // Initialize Folio
      await getOrCreateFolio(booking.id, tx);

      return { booking, customer, assignedPhysicalRoomId };
    });

    // Invalidate caches
    revalidatePath("/", "layout");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");

    return apiSuccess(
      {
        booking: {
          id: result.booking.id,
          referenceId: result.booking.referenceId,
          customerName: result.customer.name,
          customerPhone: result.customer.phone,
          customerEmail: result.customer.email,
          roomName: room.name,
          assignedRoomId: result.assignedPhysicalRoomId,
          checkIn: result.booking.checkIn,
          checkOut: result.booking.checkOut,
          nights: pricing.nights,
          totalAmount: result.booking.totalAmount,
          taxAmount: result.booking.taxAmount,
          discountAmount: result.booking.discountAmount,
          netAmount: result.booking.netAmount,
          status: result.booking.status,
        },
      },
      201
    );
  } catch (error: any) {
    console.error("Create Booking Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to create booking", 500);
  }
}
