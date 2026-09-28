import { NextResponse } from "next/server";
import { AuthSession } from "@/lib/auth";
import crypto from "crypto";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYMENT_ERROR"
  | "INVENTORY_ERROR"
  | "DATABASE_ERROR"
  | "EXTERNAL_SERVICE_ERROR";

export function apiSuccess<T>(data: T, status: number = 200, headers?: HeadersInit) {
  const requestId = crypto.randomUUID();
  return NextResponse.json(
    {
      success: true,
      data,
      requestId,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        ...headers,
      },
    }
  );
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number = 400,
  details?: unknown
) {
  const requestId = crypto.randomUUID();
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details: process.env.NODE_ENV !== "production" ? details : undefined,
      },
      requestId,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}

export function requireAuth(
  session: AuthSession | null,
  allowedRoles?: string[]
): { session: AuthSession; errorResponse?: never } | { errorResponse: NextResponse; session?: never } {
  if (!session) {
    return { errorResponse: apiError("UNAUTHORIZED", "Authentication required", 401) };
  }

  if (allowedRoles && session.role !== "SUPER_ADMIN" && !allowedRoles.includes(session.role)) {
    return {
      errorResponse: apiError(
        "FORBIDDEN",
        `Access denied. Requires one of roles: ${allowedRoles.join(", ")}`,
        403
      ),
    };
  }

  return { session };
}

export function authorizeRole(
  session: AuthSession | null,
  allowedRoles: string[]
): { authorized: boolean; response?: NextResponse } {
  const result = requireAuth(session, allowedRoles);
  if (result.errorResponse) {
    return { authorized: false, response: result.errorResponse };
  }
  return { authorized: true };
}

// In-memory sliding window rate limiter for critical endpoints
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 30,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

// Clean up stale rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.expiresAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

/**
 * Generates HMAC signature for secure invoice access
 */
export function generateInvoiceToken(bookingId: string): string {
  const secret = process.env.JWT_SECRET || "rajhans-invoice-secure-token";
  return crypto.createHmac("sha256", secret).update(`invoice-${bookingId}`).digest("hex");
}

export function verifyInvoiceToken(bookingId: string, token: string): boolean {
  const expected = generateInvoiceToken(bookingId);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
