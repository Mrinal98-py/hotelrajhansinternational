import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { addFolioItem, getOrCreateFolio } from "@/lib/folio";
import { FolioItemType, OrderStatus, PaymentOption, ServiceCategoryType } from "@prisma/client";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, [
      "SUPER_ADMIN",
      "MANAGER",
      "RECEPTION",
      "HOUSEKEEPING",
      "STAFF",
    ]);
    if (auth.errorResponse) return auth.errorResponse;

    const [services, orders] = await Promise.all([
      prisma.hotelService.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.serviceOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          items: true,
          booking: { include: { customer: true } },
        },
      }),
    ]);

    return apiSuccess({ services, orders });
  } catch (error: any) {
    console.error("GET Hotel Services Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch hotel services", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION", "STAFF"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const { action } = body; // 'ORDER_SERVICE', 'MANAGE_CATALOG'

    if (action === "MANAGE_CATALOG") {
      const { id, name, category, price, taxRate = 18, description, isActive = true } = body;
      if (!name || price === undefined) {
        return apiError("VALIDATION_ERROR", "Service name and price are required", 400);
      }

      let service;
      if (id) {
        service = await prisma.hotelService.update({
          where: { id },
          data: {
            name,
            category: category as ServiceCategoryType,
            price: parseFloat(price),
            taxRate: parseFloat(taxRate),
            description,
            isActive,
          },
        });
      } else {
        service = await prisma.hotelService.create({
          data: {
            name,
            category: category as ServiceCategoryType,
            price: parseFloat(price),
            taxRate: parseFloat(taxRate),
            description,
            isActive,
          },
        });
      }

      return apiSuccess({ message: "Service catalog updated", service });
    }

    // Default: Place Service Order
    const {
      bookingId,
      physicalRoomId,
      guestName = "Guest",
      paymentType = "CHARGE_TO_ROOM",
      items, // array of { serviceId, itemName, quantity, unitPrice }
      notes,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return apiError("VALIDATION_ERROR", "Items array is required", 400);
    }

    let totalAmount = 0;
    for (const item of items) {
      totalAmount += (parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity, 10) || 1);
    }

    const taxRate = 18; // Standard GST for hotel ancillary services
    const taxAmount = Math.round(((totalAmount * taxRate) / 100) * 100) / 100;
    const netAmount = Math.round((totalAmount + taxAmount) * 100) / 100;

    const order = await prisma.$transaction(async (tx) => {
      let folioItemId: string | null = null;

      if (paymentType === "CHARGE_TO_ROOM" && bookingId) {
        const folio = await getOrCreateFolio(bookingId, tx);
        const itemNames = items.map((i: any) => `${i.itemName} x${i.quantity}`).join(", ");
        const fItem = await addFolioItem(
          {
            folioId: folio.id,
            itemType: FolioItemType.SERVICE,
            description: `Hotel Service: ${itemNames}`,
            unitPrice: totalAmount,
            amount: totalAmount,
            taxRate,
            taxAmount,
            postedBy: currentStaff.name,
          },
          tx
        );
        folioItemId = fItem.id;
      }

      const serviceOrder = await tx.serviceOrder.create({
        data: {
          bookingId: bookingId || null,
          physicalRoomId: physicalRoomId || null,
          guestName,
          orderStatus: OrderStatus.PREPARING,
          paymentType: paymentType as PaymentOption,
          totalAmount,
          taxAmount,
          netAmount,
          folioItemId,
          notes,
          items: {
            create: items.map((i: any) => ({
              serviceId: i.serviceId || null,
              itemName: i.itemName,
              quantity: parseInt(i.quantity, 10) || 1,
              unitPrice: parseFloat(i.unitPrice) || 0,
              totalAmount: (parseFloat(i.unitPrice) || 0) * (parseInt(i.quantity, 10) || 1),
            })),
          },
        },
        include: { items: true },
      });

      return serviceOrder;
    });

    return apiSuccess({ message: "Service order created", order }, 201);
  } catch (error: any) {
    console.error("POST Hotel Service Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to process hotel service", 500);
  }
}
