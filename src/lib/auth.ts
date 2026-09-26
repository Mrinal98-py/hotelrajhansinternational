import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    throw new Error("JWT_SECRET is required in production.");
  }
  return new TextEncoder().encode(secret || "dev-only-rajhans-jwt-secret");
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "MANAGER" | "RECEPTION" | "STAFF";
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createToken(payload: AuthSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  if (!token || typeof token !== "string") return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      clockTolerance: 30, // 30 seconds clock tolerance to avoid drift issues
    });
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

export function isSecureCookie(request?: Request): boolean {
  if (process.env.COOKIE_SECURE === "false") return false;
  if (process.env.COOKIE_SECURE === "true") return true;
  if (request) {
    const proto = request.headers.get("x-forwarded-proto");
    if (proto) return proto.toLowerCase() === "https";
    try {
      const url = new URL(request.url);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return false;
      if (url.protocol === "https:") return true;
    } catch {}
  }
  return process.env.NODE_ENV === "production" && Boolean(process.env.VERCEL);
}

export async function getSession(request?: Request): Promise<AuthSession | null> {
  let token: string | undefined;

  // 1. Authorization header (Bearer token)
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 2. Cookie store via next/headers
  if (!token) {
    try {
      const cookieStore = await cookies();
      token =
        cookieStore.get("rajhans_admin_token")?.value ||
        cookieStore.get("admin_token")?.value ||
        cookieStore.get("token")?.value;
    } catch {}
  }

  // 3. Fallback: Parse request cookie header directly
  if (!token && request) {
    const rawCookies = request.headers.get("cookie");
    if (rawCookies) {
      const match = rawCookies.match(/(?:rajhans_admin_token|admin_token|token)=([^;]+)/i);
      if (match) {
        token = decodeURIComponent(match[1].trim());
      }
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}

export async function setSessionCookie(token: string, request?: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("rajhans_admin_token", token, {
      httpOnly: true,
      secure: isSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (err) {
    console.warn("setSessionCookie warning:", err);
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("rajhans_admin_token");
    cookieStore.delete("admin_token");
    cookieStore.delete("token");
  } catch (err) {
    console.warn("clearSessionCookie warning:", err);
  }
}
