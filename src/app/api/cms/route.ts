import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settingsList = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    const reviews = await prisma.review.findMany({
      where: { status: { in: ["APPROVED", "FEATURED"] } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        settings: settingsMap,
        faqs,
        reviews,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET CMS Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const { settings } = await request.json();

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Settings object is required" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), category: "cms" },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE_CMS_SETTINGS",
        entity: "Setting",
        details: "Updated CMS settings",
      },
    });

    // Invalidate public website & admin caches
    revalidatePath("/", "layout");
    revalidatePath("/admin/cms");

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("PUT CMS Settings Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
