import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    throw new Error("JWT_SECRET is required in production.");
  }
  return new TextEncoder().encode(secret || "dev-only-rajhans-jwt-secret");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract token from cookies (checking primary and fallback names) or Authorization header
  let token =
    request.cookies.get("rajhans_admin_token")?.value ||
    request.cookies.get("admin_token")?.value ||
    request.cookies.get("token")?.value;

  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, getJwtSecret(), { clockTolerance: 30 });
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Unauthenticated trying to access /admin (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete("rajhans_admin_token");
        response.cookies.delete("admin_token");
        response.cookies.delete("token");
      }
      return response;
    }
  }

  // 2. Authenticated user visiting /admin/login
  if (pathname === "/admin/login" && isAuthenticated) {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
