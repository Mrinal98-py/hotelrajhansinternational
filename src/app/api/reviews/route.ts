import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("GET Reviews Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authorName, rating = 5, reviewText, source = "Website" } = await request.json();

    if (!authorName || !reviewText) {
      return NextResponse.json({ error: "Author name and review text are required" }, { status: 400 });
    }

    const initials = authorName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const review = await prisma.review.create({
      data: {
        authorName,
        authorInitials: initials || "G",
        rating: parseInt(rating),
        reviewText,
        source,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("POST Review Error:", error);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error("PUT Review Error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
