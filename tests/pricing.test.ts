import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { calculateBookingPricing } from "../src/lib/pricing";

async function testPricingEngine() {
  console.log("▶ Testing Pricing Engine Calculations with Real DB Tariff Models...");

  const room = await prisma.room.findFirst({
    where: { slug: "executive-room" },
  });
  assert.ok(room, "Executive room must exist in database");

  // 1. Basic 2-night stay test
  const checkIn = new Date("2026-10-01");
  const checkOut = new Date("2026-10-03"); // 2 nights

  const basePricing = await calculateBookingPricing({
    roomTypeId: room.id,
    checkIn,
    checkOut,
    adults: 2,
    extraBeds: 0,
  });

  assert.equal(basePricing.nights, 2, "Stay should be 2 nights");
  assert.equal(
    basePricing.baseAmount,
    room.basePriceDouble * 2,
    `Base room charge should be 2 x ${room.basePriceDouble}`
  );
  assert.equal(basePricing.extraBedAmount, 0, "Extra beds should be 0");
  assert.equal(
    basePricing.taxAmount,
    Math.round(((basePricing.taxableAmount * basePricing.taxPercentage) / 100) * 100) / 100,
    "Tax should match GST percentage"
  );
  assert.equal(
    basePricing.netAmount,
    basePricing.taxableAmount + basePricing.taxAmount,
    "Net total should equal taxable + tax"
  );

  // 2. Extra bed test
  const extraBedPricing = await calculateBookingPricing({
    roomTypeId: room.id,
    checkIn,
    checkOut,
    adults: 3,
    extraBeds: 1,
  });

  assert.equal(
    extraBedPricing.extraBedAmount,
    room.extraBedPrice * 2,
    `Extra bed for 2 nights @ ₹${room.extraBedPrice} should be ₹${room.extraBedPrice * 2}`
  );
  assert.equal(
    extraBedPricing.grossAmount,
    extraBedPricing.baseAmount + extraBedPricing.extraBedAmount,
    "Gross should equal base + extra bed"
  );

  console.log("✔ Pricing Engine: ALL TARIFF & GST TESTS PASSED");
}

testPricingEngine()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Pricing Engine Test Failed:", err);
    process.exit(1);
  });
