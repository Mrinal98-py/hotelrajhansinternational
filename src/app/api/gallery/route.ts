import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const whereClause = category && category !== "all" ? { category } : {};
    const images = await prisma.galleryImage.findMany({
      where: whereClause,
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("GET Gallery Error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, alt, category, size = "square", displayOrder = 0 } = await request.json();

    if (!url || !category) {
      return NextResponse.json({ error: "URL and category are required" }, { status: 400 });
    }

    const image = await prisma.galleryImage.create({
      data: {
        url,
        alt: alt || "Hotel Rajhans Photo",
        category,
        size,
        displayOrder: parseInt(displayOrder),
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error("POST Gallery Error:", error);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.galleryImage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("DELETE Gallery Error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
