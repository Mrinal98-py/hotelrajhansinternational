import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, createToken, setSessionCookie, isSecureCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email || "";
    const password = body?.password || "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user: any = null;

    try {
      if (prisma && prisma.user) {
        user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
      }
    } catch (dbError) {
      console.warn("Database lookup error in login route:", dbError);
    }

    // Local development fallback only; production must authenticate against the database.
    if (!user && process.env.NODE_ENV !== "production") {
      if (cleanEmail === "admin@hotelrajhansinternational.com" && password === "admin123") {
        user = {
          id: "admin-fallback-id",
          email: "admin@hotelrajhansinternational.com",
          name: "Hotel Administrator",
          role: "SUPER_ADMIN",
          isActive: true,
        };
      } else if (cleanEmail === "manager@hotelrajhansinternational.com" && password === "manager123") {
        user = {
          id: "manager-fallback-id",
          email: "manager@hotelrajhansinternational.com",
          name: "Frontdesk Manager",
          role: "MANAGER",
          isActive: true,
        };
      }
    } else {
      if (!user.isActive) {
        return NextResponse.json({ error: "Invalid credentials or inactive account" }, { status: 401 });
      }

      let isMatch = false;
      try {
        isMatch = await comparePassword(password, user.passwordHash);
      } catch (err) {
        console.error("Password comparison error:", err);
      }

      if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    try {
      await setSessionCookie(token, request);
    } catch (cookieErr) {
      console.warn("Setting session cookie error:", cookieErr);
    }

    // Audit log (safely wrapped in try-catch to prevent failure if DB is read-only)
    try {
      if (prisma && prisma.auditLog) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userName: user.name,
            action: "LOGIN",
            entity: "User",
            entityId: user.id,
            details: `Successful login by ${user.email}`,
          },
        });
      }
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });

    response.cookies.set("rajhans_admin_token", token, {
      httpOnly: true,
      secure: isSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error?.message || String(error) },
      { status: 500 }
    );
  }
}
