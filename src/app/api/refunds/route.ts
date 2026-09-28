import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { addFolioItem, getOrCreateFolio } from "@/lib/folio";
import { FolioItemType, RefundStatus } from "@prisma/client";
import crypto from "crypto";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER"]);
    if (auth.errorResponse) return auth.errorResponse;

    const refunds = await prisma.refund.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: { customer: true },
        },
        payment: true,
      },
    });

    return apiSuccess({ refunds });
  } catch (error: any) {
    console.error("GET Refunds Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch refunds", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const {
      bookingId,
      paymentId,
      refundAmount,
      reason,
      idempotencyKey,
      refundMethod = "CASH", // 'CASH', 'GATEWAY', 'BANK_TRANSFER'
    } = body;

    if (!bookingId || !refundAmount || !reason) {
      return apiError(
        "VALIDATION_ERROR",
        "bookingId, refundAmount, and reason are required.",
        400
      );
    }

    const cleanAmount = parseFloat(refundAmount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return apiError("VALIDATION_ERROR", "Refund amount must be a positive number.", 400);
    }

    // Check Idempotency Key
    const safeKey = idempotencyKey || `ref_${bookingId}_${cleanAmount}_${crypto.randomUUID()}`;
    const existingRefund = await prisma.refund.findUnique({
      where: { idempotencyKey: safeKey },
    });

    if (existingRefund) {
      return apiSuccess({
        message: "Refund already processed (idempotent response)",
        refund: existingRefund,
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return apiError("NOT_FOUND", "Booking not found", 404);
    }

    if (cleanAmount > booking.paidAmount) {
      return apiError(
        "CONFLICT",
        `Refund amount (₹${cleanAmount}) cannot exceed total paid amount (₹${booking.paidAmount})`,
        400
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Refund record
      const refund = await tx.refund.create({
        data: {
          bookingId,
          paymentId: paymentId || null,
          refundAmount: cleanAmount,
          reason,
          status: RefundStatus.PROCESSED,
          idempotencyKey: safeKey,
          initiatedBy: currentStaff.name,
          approvedBy: currentStaff.role === "SUPER_ADMIN" ? currentStaff.name : null,
        },
      });

      // 2. Post to Folio as REFUND item
      const folio = await getOrCreateFolio(bookingId, tx);
      await addFolioItem(
        {
          folioId: folio.id,
          itemType: FolioItemType.REFUND,
          description: `Refund Issued (${refundMethod}): ${reason}`,
          unitPrice: cleanAmount,
          postedBy: currentStaff.name,
          referenceId: refund.id,
        },
        tx
      );

      // 3. Update Payment record status if paymentId provided
      if (paymentId) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "REFUNDED" },
        });
      }

      // 4. If cash refund, record cash outflow in active cashier shift
      if (refundMethod === "CASH") {
        const activeShift = await tx.cashierShift.findFirst({
          where: { status: "OPEN" },
          orderBy: { openedAt: "desc" },
        });

        if (activeShift) {
          await tx.cashTransaction.create({
            data: {
              shiftId: activeShift.id,
              type: "REFUND_PAID",
              amount: cleanAmount,
              reason: `Refund paid for booking ${booking.referenceId}: ${reason}`,
              bookingId,
              recordedBy: currentStaff.name,
            },
          });

          await tx.cashierShift.update({
            where: { id: activeShift.id },
            data: {
              closingBalanceExpected: { decrement: cleanAmount },
            },
          });
        }
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "REFUND_PROCESSED",
          entity: "Refund",
          entityId: refund.id,
          details: `Processed ₹${cleanAmount} refund for booking ${booking.referenceId}. Reason: ${reason}`,
        },
      });

      return refund;
    });

    return apiSuccess({
      message: `Refund of ₹${cleanAmount} processed successfully.`,
      refund: result,
    }, 201);
  } catch (error: any) {
    console.error("Process Refund Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to process refund", 500);
  }
}
