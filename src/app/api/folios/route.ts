import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, requireAuth } from "@/lib/security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL"; // ALL, OPEN, CLOSED, OVERDUE
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { folioNumber: { contains: search, mode: "insensitive" } },
        { booking: { referenceId: { contains: search, mode: "insensitive" } } },
        { booking: { customer: { name: { contains: search, mode: "insensitive" } } } },
        { booking: { customer: { phone: { contains: search } } } },
        {
          booking: {
            roomAssignments: {
              some: {
                physicalRoom: { roomNumber: { contains: search } },
              },
            },
          },
        },
      ];
    }

    const [total, folios] = await Promise.all([
      prisma.folio.count({ where: whereClause }),
      prisma.folio.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          booking: {
            include: {
              customer: true,
              room: true,
              roomAssignments: {
                where: { status: { in: ["ASSIGNED", "ACTIVE"] } },
                include: { physicalRoom: true },
              },
            },
          },
          items: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
    ]);

    return apiSuccess({
      folios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET Folios List Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch folios", 500);
  }
}
