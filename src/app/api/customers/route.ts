import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        bookings: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { room: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, customers },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Customers Error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, vipStatus, notes, address, idProofNumber } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        vipStatus: vipStatus !== undefined ? vipStatus : undefined,
        notes: notes !== undefined ? notes : undefined,
        address: address !== undefined ? address : undefined,
        idProofNumber: idProofNumber !== undefined ? idProofNumber : undefined,
      },
    });

    // Invalidate admin customers cache
    revalidatePath("/admin/customers");

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error("PUT Customer Error:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
