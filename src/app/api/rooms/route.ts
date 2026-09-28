import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        images: true,
        amenities: true,
      },
    });

    return NextResponse.json(
      { success: true, rooms },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Rooms Error:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      type,
      description,
      capacity,
      basePriceSingle,
      basePriceDouble,
      weekendPrice,
      holidayPrice,
      extraBedPrice,
      taxPercentage,
      status,
      displayOrder,
      amenities,
      images,
    } = body;

    const room = await prisma.room.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        type,
        description,
        capacity: capacity || 2,
        basePriceSingle: parseFloat(basePriceSingle),
        basePriceDouble: parseFloat(basePriceDouble),
        weekendPrice: weekendPrice ? parseFloat(weekendPrice) : null,
        holidayPrice: holidayPrice ? parseFloat(holidayPrice) : null,
        extraBedPrice: parseFloat(extraBedPrice || "500"),
        taxPercentage: parseFloat(taxPercentage || "12"),
        status: status || "AVAILABLE",
        displayOrder: parseInt(displayOrder || "0"),
        amenities: {
          create: (amenities || []).map((am: string) => ({ amenityName: am })),
        },
        images: {
          create: (images || []).map((img: { url: string; alt?: string; isPrimary?: boolean }) => ({
            url: img.url,
            alt: img.alt || name,
            isPrimary: img.isPrimary || false,
          })),
        },
      },
      include: {
        amenities: true,
        images: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "CREATE_ROOM",
        entity: "Room",
        entityId: room.id,
        details: `Created room ${room.name}`,
      },
    });

    // Invalidate public website & admin caches
    revalidatePath("/", "layout");
    revalidatePath("/admin/rooms");

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error("POST Room Error:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
