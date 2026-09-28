import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { ShiftStatus } from "@prisma/client";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const drawerId = searchParams.get("drawerId");
    const status = searchParams.get("status");

    const where: any = {};
    if (drawerId) where.drawerId = drawerId;
    if (status) where.status = status;

    const [drawers, shifts, activeShift] = await Promise.all([
      prisma.cashDrawer.findMany({ where: { isActive: true } }),
      prisma.cashierShift.findMany({
        where,
        orderBy: { openedAt: "desc" },
        take: 50,
        include: {
          drawer: true,
          transactions: { orderBy: { createdAt: "desc" } },
        },
      }),
      prisma.cashierShift.findFirst({
        where: { status: "OPEN" },
        orderBy: { openedAt: "desc" },
        include: {
          drawer: true,
          transactions: { orderBy: { createdAt: "desc" } },
        },
      }),
    ]);

    return apiSuccess({ drawers, shifts, activeShift });
  } catch (error: any) {
    console.error("GET Cashier Shifts Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch cashier shifts", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const { action } = body; // 'OPEN_SHIFT', 'CLOSE_SHIFT', 'ADD_TRANSACTION'

    if (action === "OPEN_SHIFT") {
      const { drawerId, openingBalance = 0, notes } = body;

      // Check if drawer has another open shift
      const existingOpen = await prisma.cashierShift.findFirst({
        where: { drawerId, status: "OPEN" },
      });

      if (existingOpen) {
        return apiError(
          "CONFLICT",
          `Shift is already OPEN on this drawer by ${existingOpen.cashierName}. Close it first before opening a new shift.`,
          409
        );
      }

      const cleanOpening = parseFloat(openingBalance || "0");
      const shift = await prisma.cashierShift.create({
        data: {
          drawerId,
          cashierId: currentStaff.userId,
          cashierName: currentStaff.name,
          openingBalance: cleanOpening,
          closingBalanceExpected: cleanOpening,
          status: ShiftStatus.OPEN,
          notes,
        },
        include: { drawer: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "CASHIER_SHIFT_OPENED",
          entity: "CashierShift",
          entityId: shift.id,
          details: `Opened cashier shift on ${shift.drawer.name} with opening balance of ₹${cleanOpening}`,
        },
      });

      return apiSuccess({ message: "Shift opened successfully", shift }, 201);
    }

    if (action === "CLOSE_SHIFT") {
      const { shiftId, actualClosingBalance, notes } = body;
      if (!shiftId || actualClosingBalance === undefined) {
        return apiError("VALIDATION_ERROR", "shiftId and actualClosingBalance are required.", 400);
      }

      const shift = await prisma.cashierShift.findUnique({
        where: { id: shiftId },
        include: { drawer: true, transactions: true },
      });

      if (!shift) {
        return apiError("NOT_FOUND", "Cashier shift not found", 404);
      }

      if (shift.status !== "OPEN") {
        return apiError("CONFLICT", "Shift is already closed or reconciled", 400);
      }

      const actualCash = parseFloat(actualClosingBalance);
      const expectedCash = shift.closingBalanceExpected;
      const discrepancy = Math.round((actualCash - expectedCash) * 100) / 100;

      const closedShift = await prisma.cashierShift.update({
        where: { id: shiftId },
        data: {
          closedAt: new Date(),
          closingBalanceActual: actualCash,
          discrepancy,
          status: ShiftStatus.CLOSED,
          supervisorId: currentStaff.role === "SUPER_ADMIN" || currentStaff.role === "MANAGER" ? currentStaff.userId : null,
          notes: notes ? `${shift.notes || ""}\nClosing note: ${notes}` : shift.notes,
        },
      });

      // Update Cash Drawer current balance
      await prisma.cashDrawer.update({
        where: { id: shift.drawerId },
        data: { currentBalance: actualCash },
      });

      await prisma.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "CASHIER_SHIFT_CLOSED",
          entity: "CashierShift",
          entityId: shift.id,
          details: `Closed shift. Expected: ₹${expectedCash}, Actual: ₹${actualCash}, Discrepancy: ₹${discrepancy}`,
        },
      });

      return apiSuccess({
        message: "Shift closed and reconciled successfully",
        shift: closedShift,
        discrepancy,
      });
    }

    if (action === "ADD_TRANSACTION") {
      const { shiftId, type, amount, reason } = body; // type: CASH_IN, CASH_OUT, EXPENSE, DROP
      if (!shiftId || !type || !amount || !reason) {
        return apiError("VALIDATION_ERROR", "shiftId, type, amount, and reason are required.", 400);
      }

      const cleanAmount = parseFloat(amount);
      const isPositive = type === "CASH_IN" || type === "PAYMENT_RECEIVED";

      const tx = await prisma.$transaction(async (prismaTx) => {
        const cashTx = await prismaTx.cashTransaction.create({
          data: {
            shiftId,
            type,
            amount: cleanAmount,
            reason,
            recordedBy: currentStaff.name,
          },
        });

        await prismaTx.cashierShift.update({
          where: { id: shiftId },
          data: {
            closingBalanceExpected: isPositive
              ? { increment: cleanAmount }
              : { decrement: cleanAmount },
          },
        });

        return cashTx;
      });

      return apiSuccess({ message: "Cash transaction recorded", transaction: tx }, 201);
    }

    return apiError("VALIDATION_ERROR", "Invalid action specified", 400);
  } catch (error: any) {
    console.error("POST Cashier Shift Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to process cashier action", 500);
  }
}
