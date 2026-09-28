import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/security";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    // 1. Strictly block in production environments
    if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
      return apiError(
        "FORBIDDEN",
        "Payment reset endpoint is strictly disabled in production environments.",
        403
      );
    }

    // 2. Explicit Environment Flag Guard
    if (process.env.ALLOW_PAYMENT_RESET !== "true") {
      return apiError(
        "FORBIDDEN",
        "Payment reset requires ALLOW_PAYMENT_RESET=true environment flag.",
        403
      );
    }

    // 3. Super Admin Role Guard
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return apiError(
        "FORBIDDEN",
        "Super Admin credentials required to execute financial reset.",
        403
      );
    }

    // 4. Require explicit confirmation phrase in request body
    const body = await request.json().catch(() => ({}));
    if (body.confirmationPhrase !== "CONFIRM_RESET_DEVELOPMENT_ONLY") {
      return apiError(
        "VALIDATION_ERROR",
        "Action aborted: Invalid confirmation phrase. Required: CONFIRM_RESET_DEVELOPMENT_ONLY",
        400
      );
    }

    // 5. Execute reset inside transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete payments
      const deletedPayments = await tx.payment.deleteMany();

      // Reset booking paid amounts & statuses back to PENDING
      await tx.booking.updateMany({
        data: {
          paidAmount: 0,
          status: "PENDING",
        },
      });

      // Reset customer CRM total spent
      await tx.customer.updateMany({
        data: {
          totalSpent: 0,
        },
      });

      // Clear Folio items & reset balances
      await tx.folioItem.deleteMany();
      await tx.folio.updateMany({
        data: {
          totalPaid: 0,
          balanceAmount: 0,
          status: "OPEN",
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          userName: session.name,
          action: "RESET_PAYMENT_METRICS_DEV",
          entity: "Payment",
          details: `DEVELOPMENT RESET executed by ${session.name} (${session.email}). Deleted ${deletedPayments.count} payment logs.`,
        },
      });

      return deletedPayments.count;
    });

    return apiSuccess({
      message: "Development payment logs and financial metrics reset successfully.",
      deletedRecords: result,
    });
  } catch (error: any) {
    console.error("POST Reset Payments Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to reset payments", 500);
  }
}
