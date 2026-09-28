import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { generateSafeOrderNumber } from "@/lib/sequence";
import { addFolioItem, getOrCreateFolio } from "@/lib/folio";
import { FolioItemType, OrderStatus, PaymentOption } from "@prisma/client";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, [
      "SUPER_ADMIN",
      "MANAGER",
      "RECEPTION",
      "RESTAURANT",
      "STAFF",
    ]);
    if (auth.errorResponse) return auth.errorResponse;

    const [categories, orders] = await Promise.all([
      prisma.menuCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: {
          items: { where: { isAvailable: true } },
        },
      }),
      prisma.restaurantOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          items: true,
          booking: {
            include: { customer: true },
          },
        },
      }),
    ]);

    return apiSuccess({ categories, orders });
  } catch (error: any) {
    console.error("GET Restaurant Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch restaurant data", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RESTAURANT", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const {
      tableNumber,
      physicalRoomId,
      bookingId,
      paymentType = "PAID_NOW", // 'PAID_NOW' or 'CHARGE_TO_ROOM'
      items, // array of { menuItemId, name, quantity, price }
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return apiError("VALIDATION_ERROR", "Items array is required and cannot be empty", 400);
    }

    if (paymentType === "CHARGE_TO_ROOM" && !bookingId) {
      return apiError(
        "VALIDATION_ERROR",
        "bookingId is required when charging order to room folio.",
        400
      );
    }

    let totalAmount = 0;
    for (const item of items) {
      totalAmount += (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1);
    }

    const taxRate = 5; // GST 5% on restaurant food
    const taxAmount = Math.round(((totalAmount * taxRate) / 100) * 100) / 100;
    const netAmount = Math.round((totalAmount + taxAmount) * 100) / 100;

    const orderNumber = await generateSafeOrderNumber("RES");

    const order = await prisma.$transaction(async (tx) => {
      let folioItemId: string | null = null;

      // If CHARGE_TO_ROOM, post to guest folio
      if (paymentType === "CHARGE_TO_ROOM" && bookingId) {
        const folio = await getOrCreateFolio(bookingId, tx);
        const itemDescriptions = items.map((i: any) => `${i.name} x${i.quantity}`).join(", ");
        const folioItem = await addFolioItem(
          {
            folioId: folio.id,
            itemType: FolioItemType.RESTAURANT,
            description: `Restaurant Order ${orderNumber}: ${itemDescriptions}`,
            unitPrice: totalAmount,
            amount: totalAmount,
            taxRate,
            taxAmount,
            postedBy: currentStaff.name,
            referenceId: orderNumber,
          },
          tx
        );
        folioItemId = folioItem.id;
      }

      // Create Restaurant Order
      const resOrder = await tx.restaurantOrder.create({
        data: {
          orderNumber,
          tableNumber,
          physicalRoomId,
          bookingId: bookingId || null,
          status: OrderStatus.PREPARING,
          paymentType: paymentType as PaymentOption,
          totalAmount,
          taxAmount,
          netAmount,
          folioItemId,
          items: {
            create: items.map((i: any) => ({
              menuItemId: i.menuItemId || null,
              name: i.name,
              quantity: parseInt(i.quantity, 10) || 1,
              price: parseFloat(i.price) || 0,
              total: (parseFloat(i.price) || 0) * (parseInt(i.quantity, 10) || 1),
            })),
          },
        },
        include: { items: true },
      });

      // If cash paid now, record in active cashier shift
      if (paymentType === "PAID_NOW") {
        const activeShift = await tx.cashierShift.findFirst({
          where: { status: "OPEN" },
          orderBy: { openedAt: "desc" },
        });

        if (activeShift) {
          await tx.cashTransaction.create({
            data: {
              shiftId: activeShift.id,
              type: "CASH_IN",
              amount: netAmount,
              reason: `Restaurant POS Cash Sale: ${orderNumber}`,
              recordedBy: currentStaff.name,
            },
          });

          await tx.cashierShift.update({
            where: { id: activeShift.id },
            data: { closingBalanceExpected: { increment: netAmount } },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: currentStaff.userId,
          userName: currentStaff.name,
          action: "RESTAURANT_ORDER_CREATED",
          entity: "RestaurantOrder",
          entityId: resOrder.id,
          details: `Created restaurant order ${orderNumber} (₹${netAmount}, ${paymentType})`,
        },
      });

      return resOrder;
    });

    return apiSuccess({ message: `Order ${orderNumber} created`, order }, 201);
  } catch (error: any) {
    console.error("POST Restaurant Order Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to create restaurant order", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RESTAURANT", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const { orderId, status } = body;

    if (!orderId || !status) {
      return apiError("VALIDATION_ERROR", "orderId and status are required", 400);
    }

    const updated = await prisma.restaurantOrder.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentStaff.userId,
        userName: currentStaff.name,
        action: "RESTAURANT_ORDER_STATUS_UPDATED",
        entity: "RestaurantOrder",
        entityId: orderId,
        details: `Updated order ${updated.orderNumber} status to ${status}`,
      },
    });

    return apiSuccess({ message: "Order status updated", order: updated });
  } catch (error: any) {
    console.error("PATCH Restaurant Order Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to update restaurant order", 500);
  }
}

