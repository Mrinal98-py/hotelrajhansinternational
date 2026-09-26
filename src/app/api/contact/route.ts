import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { syncInquiryToGoogleSheet } from "@/lib/googlesheets";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("GET Contact Messages Error:", error);
    return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const contactMsg = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        message,
        status: "UNREAD",
      },
    });

    // Synchronize Contact Inquiry to Google Sheets ('Inquiries' tab)
    try {
      await syncInquiryToGoogleSheet({
        id: contactMsg.id,
        createdAt: contactMsg.createdAt,
        name: contactMsg.name,
        email: contactMsg.email,
        phone: contactMsg.phone,
        message: contactMsg.message,
        status: contactMsg.status,
      });
    } catch (sheetErr) {
      console.error("Non-blocking Inquiry Google Sheets sync error:", sheetErr);
    }

    return NextResponse.json({ success: true, message: contactMsg });
  } catch (error) {
    console.error("POST Contact Error:", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, replyText } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: status || undefined,
        replyText: replyText !== undefined ? replyText : undefined,
      },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error("PUT Contact Error:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}
