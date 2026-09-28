import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { DiscountType } from "@prisma/client";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER"]);
    if (auth.errorResponse) return auth.errorResponse;

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ promotions });
  } catch (error: any) {
    console.error("GET Promotions Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch promotions", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action = "VALIDATE" } = body;

    // Public / Guest Validation Action
    if (action === "VALIDATE") {
      const { code, grossAmount = 0 } = body;
      if (!code) {
        return apiError("VALIDATION_ERROR", "Promotion code is required", 400);
      }

      const cleanCode = code.trim().toUpperCase();
      const promo = await prisma.promotion.findUnique({
        where: { code: cleanCode },
      });

      if (!promo || !promo.isActive) {
        return apiError("NOT_FOUND", "Invalid or inactive promotion code", 404);
      }

      const now = new Date();
      if (promo.validFrom && promo.validFrom > now) {
        return apiError("CONFLICT", "Promotion code is not active yet", 400);
      }

      if (promo.validUntil && promo.validUntil < now) {
        return apiError("CONFLICT", "Promotion code has expired", 400);
      }

      if (promo.usedCount >= promo.usageLimit) {
        return apiError("CONFLICT", "Promotion code has reached its maximum usage limit", 400);
      }

      const cleanGross = parseFloat(grossAmount);
      if (cleanGross < promo.minSpend) {
        return apiError(
          "CONFLICT",
          `Promotion requires a minimum booking amount of ₹${promo.minSpend}`,
          400
        );
      }

      let discountAmount = 0;
      if (promo.discountType === "PERCENTAGE") {
        discountAmount = (cleanGross * promo.discountValue) / 100;
        if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
          discountAmount = promo.maxDiscount;
        }
      } else {
        discountAmount = promo.discountValue;
      }

      discountAmount = Math.min(discountAmount, cleanGross);

      return apiSuccess({
        valid: true,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
      });
    }

    // Admin Creation Action
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER"]);
    if (auth.errorResponse) return auth.errorResponse;

    const {
      code,
      description,
      discountType = "PERCENTAGE",
      discountValue,
      minSpend = 0,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit = 100,
      isActive = true,
    } = body;

    if (!code || discountValue === undefined) {
      return apiError("VALIDATION_ERROR", "Code and discountValue are required", 400);
    }

    const cleanCode = code.trim().toUpperCase();

    const promotion = await prisma.promotion.upsert({
      where: { code: cleanCode },
      update: {
        description,
        discountType: discountType as DiscountType,
        discountValue: parseFloat(discountValue),
        minSpend: parseFloat(minSpend || "0"),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: parseInt(usageLimit, 10),
        isActive,
      },
      create: {
        code: cleanCode,
        description,
        discountType: discountType as DiscountType,
        discountValue: parseFloat(discountValue),
        minSpend: parseFloat(minSpend || "0"),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: parseInt(usageLimit, 10),
        isActive,
      },
    });

    return apiSuccess({ message: "Promotion saved successfully", promotion }, 201);
  } catch (error: any) {
    console.error("POST Promotion Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to process promotion", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return apiError("VALIDATION_ERROR", "id parameter is required", 400);
    }

    await prisma.promotion.delete({ where: { id } });
    return apiSuccess({ message: "Promotion deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Promotion Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to delete promotion", 500);
  }
}

