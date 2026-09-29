import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { addFolioItem, recalculateFolioTotals, reverseFolioItem } from "@/lib/folio";
import { FolioItemType, PaymentMethod, PaymentStatus } from "@prisma/client";

export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const folio = await prisma.folio.findFirst({
      where: {
        OR: [{ id }, { bookingId: id }, { folioNumber: id }],
      },
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
    });

    if (!folio) {
      return apiError("NOT_FOUND", "Folio not found", 404);
    }

    return apiSuccess({ folio });
  } catch (error: any) {
    console.error("GET Folio Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch folio", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const {
      itemType, // ROOM_CHARGE, RESTAURANT, ROOM_SERVICE, LAUNDRY, MINIBAR, EXTRA_BED, SERVICE, TAX, DISCOUNT, ADJUSTMENT, PAYMENT, REFUND
      description,
      quantity = 1,
      unitPrice,
      amount,
      taxRate = 0,
      taxAmount,
      referenceId,
      paymentMethod, // When itemType === 'PAYMENT'
    } = body;

    const folio = await prisma.folio.findFirst({
      where: { OR: [{ id }, { bookingId: id }, { folioNumber: id }] },
      include: { booking: true },
    });

    if (!folio) {
      return apiError("NOT_FOUND", "Folio not found", 404);
    }

    // Action: REVERSE existing folio item
    if (body.action === "REVERSE") {
      const { originalItemId, reason = "Correction" } = body;
      if (!originalItemId) {
        return apiError("VALIDATION_ERROR", "originalItemId is required for reversal", 400);
      }

      const reversalResult = await prisma.$transaction(async (tx) => {
        const revItem = await reverseFolioItem({
          folioId: folio.id,
          originalItemId,
          reason,
          reversedBy: currentStaff.name,
          tx,
        });

        await tx.auditLog.create({
          data: {
            userId: currentStaff.userId,
            userName: currentStaff.name,
            action: "FOLIO_ITEM_REVERSED",
            entity: "Folio",
            entityId: folio.id,
            details: `Reversed item ${originalItemId} on folio ${folio.folioNumber}: ${reason}`,
          },
        });

        const refreshed = await tx.folio.findUnique({
          where: { id: folio.id },
          include: { items: true },
        });

        return { revItem, refreshed };
      });

      return apiSuccess({
        message: "Folio item successfully reversed",
        item: reversalResult.revItem,
        folio: reversalResult.refreshed,
      });
    }

    if (!itemType || !description || unitPrice === undefined) {
      return apiError(
        "VALIDATION_ERROR",
        "itemType, description, and unitPrice are required.",
        400
      );
    }

    const cleanPrice = parseFloat(unitPrice);
    const cleanQty = parseInt(quantity, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. If this is a split payment, record in Payment table as well
      let paymentRecordId = referenceId;
      if (itemType === "PAYMENT") {
        const pRecord = await tx.payment.create({
          data: {
            bookingId: folio.bookingId,
            amount: cleanPrice * cleanQty,
            method: (paymentMethod as PaymentMethod) || "CASH",
            status: PaymentStatus.SUCCESS,
            receivedBy: currentStaff.name,
            referenceNote: description,
          },
        });
        paymentRecordId = pRecord.id;

        // If Cash payment, record in active Cashier Shift
        if (paymentMethod === "CASH") {
          const activeShift = await tx.cashierShift.findFirst({
            where: { status: "OPEN" },
            orderBy: { openedAt: "desc" },
          });

          if (activeShift) {
            await tx.cashTransaction.create({
              data: {
                shiftId: activeShift.id,
                type: "PAYMENT_RECEIVED",
                amount: cleanPrice * cleanQty,
                reason: `Folio payment for ${folio.folioNumber}: ${description}`,
                bookingId: folio.bookingId,
                paymentId: pRecord.id,
                recordedBy: currentStaff.name,
              },
            });

            await tx.cashierShift.update({
              where: { id: activeShift.id },
              data: {
                closingBalanceExpected: { increment: cleanPrice * cleanQty },
              },
            });
          }
        }
      }

      // 2. Add Folio Item
      const item = await addFolioItem(
        {
          folioId: folio.id,
          itemType: itemType as FolioItemType,
          description,
          quantity: cleanQty,
          unitPrice: cleanPrice,
          amount,
          taxRate: parseFloat(taxRate || "0"),
          taxAmount: taxAmount !== undefined ? parseFloat(taxAmount) : undefined,
          referenceId: paymentRecordId,
          postedBy: currentStaff.name,
        },
        tx
      );

      // 3. Recalculate totals
      const updatedFolio = await recalculateFolioTotals(folio.id, tx);

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: `FOLIO_ITEM_ADDED_${itemType}`,
          entity: "Folio",
          entityId: folio.id,
          details: `Added ${itemType} item to folio ${folio.folioNumber}: ${description} (₹${cleanPrice * cleanQty})`,
        },
      });

      return { item, updatedFolio };
    });

    return apiSuccess({
      message: `Folio item successfully added`,
      item: result.item,
      folio: result.updatedFolio,
    });
  } catch (error: any) {
    console.error("POST Folio Item Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to post folio item", 500);
  }
}
