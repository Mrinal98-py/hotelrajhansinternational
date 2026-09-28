import { prisma } from "@/lib/prisma";
import { calculateNights } from "@/lib/utils";

export interface PricingCalculationResult {
  roomTypeId: string;
  roomName: string;
  nights: number;
  ratePerNight: number;
  baseAmount: number;
  extraBedCount: number;
  extraBedAmount: number;
  grossAmount: number;
  discountAmount: number;
  discountCode?: string;
  taxableAmount: number;
  taxPercentage: number;
  taxAmount: number;
  netAmount: number;
  nightlyBreakdown: Array<{
    date: string;
    rate: number;
    reason: string;
  }>;
}

export async function calculateBookingPricing(params: {
  roomTypeId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  adults?: number;
  children?: number;
  extraBeds?: number;
  couponCode?: string;
}): Promise<PricingCalculationResult> {
  const { roomTypeId, checkIn, checkOut, adults = 2, extraBeds = 0, couponCode } = params;

  const room = await prisma.room.findUnique({
    where: { id: roomTypeId },
    include: {
      seasonalRates: { where: { isActive: true } },
      ratePlans: { where: { isActive: true } },
    },
  });

  if (!room) {
    throw new Error("Room type not found");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = calculateNights(checkInDate, checkOutDate);

  const isDouble = adults > 1;
  const baseRate = isDouble ? room.basePriceDouble : room.basePriceSingle;
  const weekendRate = room.weekendPrice || baseRate;
  const holidayRate = room.holidayPrice || baseRate;

  const nightlyBreakdown: Array<{ date: string; rate: number; reason: string }> = [];
  let baseAmount = 0;

  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkInDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday

    // 1. Check Seasonal Rate Override
    const activeSeasonal = room.seasonalRates.find(
      (sr) => new Date(sr.startDate) <= currentDate && new Date(sr.endDate) >= currentDate
    );

    let nightlyRate = baseRate;
    let reason = isDouble ? "Base Double Rate" : "Base Single Rate";

    if (activeSeasonal) {
      if (isDouble && activeSeasonal.priceDoubleOverride) {
        nightlyRate = activeSeasonal.priceDoubleOverride;
      } else if (!isDouble && activeSeasonal.priceSingleOverride) {
        nightlyRate = activeSeasonal.priceSingleOverride;
      } else if (activeSeasonal.multiplier) {
        nightlyRate = Math.round(baseRate * activeSeasonal.multiplier);
      }
      reason = `Seasonal Rate: ${activeSeasonal.name}`;
    } else if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      // Weekend rate
      nightlyRate = weekendRate;
      reason = "Weekend Rate";
    }

    baseAmount += nightlyRate;
    nightlyBreakdown.push({ date: dateStr, rate: nightlyRate, reason });
  }

  const averageRatePerNight = Math.round(baseAmount / nights);

  // Extra bed calculations
  const extraBedPricePerNight = room.extraBedPrice || 500;
  const extraBedAmount = extraBeds * extraBedPricePerNight * nights;

  const grossAmount = baseAmount + extraBedAmount;

  // Promotion / Coupon discount calculation
  let discountAmount = 0;
  let appliedCouponCode: string | undefined;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const promo = await prisma.promotion.findUnique({
      where: { code: cleanCode },
    });

    if (promo && promo.isActive) {
      const now = new Date();
      const isValidDate =
        (!promo.validFrom || promo.validFrom <= now) &&
        (!promo.validUntil || promo.validUntil >= now);
      const isUnderUsageLimit = promo.usedCount < promo.usageLimit;
      const meetsMinSpend = grossAmount >= promo.minSpend;

      if (isValidDate && isUnderUsageLimit && meetsMinSpend) {
        if (promo.discountType === "PERCENTAGE") {
          discountAmount = (grossAmount * promo.discountValue) / 100;
          if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
            discountAmount = promo.maxDiscount;
          }
        } else {
          discountAmount = promo.discountValue;
        }
        appliedCouponCode = promo.code;
      }
    } else {
      // Check legacy Coupon table
      const legacyCoupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });
      if (legacyCoupon && legacyCoupon.isActive) {
        if (legacyCoupon.discountType === "PERCENTAGE") {
          discountAmount = (grossAmount * legacyCoupon.discountValue) / 100;
        } else {
          discountAmount = legacyCoupon.discountValue;
        }
        appliedCouponCode = legacyCoupon.code;
      }
    }
  }

  // Ensure discount doesn't exceed gross amount
  discountAmount = Math.min(discountAmount, grossAmount);

  const taxableAmount = grossAmount - discountAmount;

  // Tax calculation (GST 12% or 18% based on slab or room taxPercentage)
  const taxPercentage = room.taxPercentage || 12;
  const taxAmount = Math.round(((taxableAmount * taxPercentage) / 100) * 100) / 100;
  const netAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    roomTypeId: room.id,
    roomName: room.name,
    nights,
    ratePerNight: averageRatePerNight,
    baseAmount,
    extraBedCount: extraBeds,
    extraBedAmount,
    grossAmount,
    discountAmount,
    discountCode: appliedCouponCode,
    taxableAmount,
    taxPercentage,
    taxAmount,
    netAmount,
    nightlyBreakdown,
  };
}
