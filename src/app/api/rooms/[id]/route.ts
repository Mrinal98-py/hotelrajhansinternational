import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        images: true,
        amenities: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, room },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Room Single Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
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

    // Delete existing amenities if array supplied
    if (Array.isArray(amenities)) {
      await prisma.roomAmenity.deleteMany({ where: { roomId: id } });
    }

    // Delete existing images if array supplied
    if (Array.isArray(images)) {
      await prisma.roomImage.deleteMany({ where: { roomId: id } });
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        name,
        type,
        description,
        capacity: capacity ? parseInt(capacity) : undefined,
        basePriceSingle: basePriceSingle !== undefined ? parseFloat(basePriceSingle) : undefined,
        basePriceDouble: basePriceDouble !== undefined ? parseFloat(basePriceDouble) : undefined,
        weekendPrice: weekendPrice ? parseFloat(weekendPrice) : null,
        holidayPrice: holidayPrice ? parseFloat(holidayPrice) : null,
        extraBedPrice: extraBedPrice !== undefined ? parseFloat(extraBedPrice) : undefined,
        taxPercentage: taxPercentage !== undefined ? parseFloat(taxPercentage) : undefined,
        status,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
        amenities: Array.isArray(amenities)
          ? {
              create: amenities
                .map((am: any) => (typeof am === "string" ? am : am?.amenityName))
                .filter(Boolean)
                .map((name: string) => ({ amenityName: name })),
            }
          : undefined,
        images: Array.isArray(images)
          ? {
              create: images
                .filter((img: any) => img && (img.url || typeof img === "string"))
                .map((img: any) => ({
                  url: typeof img === "string" ? img : img.url,
                  alt: typeof img === "object" ? img.alt || name : name,
                  isPrimary: typeof img === "object" ? Boolean(img.isPrimary) : false,
                })),
            }
          : undefined,
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
        action: "UPDATE_ROOM",
        entity: "Room",
        entityId: id,
        details: `Updated room ${updatedRoom.name}`,
      },
    });

    // Invalidate public website & admin caches
    revalidatePath("/", "layout");
    revalidatePath("/admin/rooms");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error("PUT Room Error:", error);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden: Higher privileges required" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.room.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "DELETE_ROOM",
        entity: "Room",
        entityId: id,
        details: `Deleted room ID ${id}`,
      },
    });

    // Invalidate public website & admin caches
    revalidatePath("/", "layout");
    revalidatePath("/admin/rooms");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true, message: "Room deleted" });
  } catch (error) {
    console.error("DELETE Room Error:", error);
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}
