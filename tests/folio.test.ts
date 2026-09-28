import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { addFolioItem, getOrCreateFolio, recalculateFolioTotals } from "../src/lib/folio";
import { FolioItemType } from "@prisma/client";

async function testFolioLedger() {
  console.log("▶ Testing Dynamic Folio Ledger & Split Payments...");

  // Find existing booking to attach test folio
  const booking = await prisma.booking.findFirst({
    include: { folio: true },
  });
  assert.ok(booking, "Need at least one booking to test folio ledger");

  const folio = await getOrCreateFolio(booking.id);
  assert.ok(folio, "Folio must be created or retrieved");

  // Record initial totals
  const initialCharges = folio.totalCharges;
  const initialTaxes = folio.totalTaxes;
  const initialPaid = folio.totalPaid;

  // 1. Add Room Service Charge item (₹1,500 + 5% tax = ₹75 tax)
  const roomServiceItem = await addFolioItem({
    folioId: folio.id,
    itemType: FolioItemType.ROOM_SERVICE,
    description: "TEST Dinner Tray",
    quantity: 1,
    unitPrice: 1500,
    amount: 1500,
    taxRate: 5,
    taxAmount: 75,
    postedBy: "TEST_RUNNER",
  });

  // Verify recalculation
  const afterCharge = await prisma.folio.findUnique({ where: { id: folio.id } });
  assert.ok(afterCharge);
  assert.equal(
    afterCharge.totalCharges,
    initialCharges + 1500,
    "Folio totalCharges should increment by ₹1,500"
  );
  assert.equal(
    afterCharge.totalTaxes,
    initialTaxes + 75,
    "Folio totalTaxes should increment by ₹75"
  );

  // 2. Add Split Payment 1 (₹1,000 Cash)
  const payment1 = await addFolioItem({
    folioId: folio.id,
    itemType: FolioItemType.PAYMENT,
    description: "TEST Partial Cash Payment",
    quantity: 1,
    unitPrice: 1000,
    amount: 1000,
    taxRate: 0,
    taxAmount: 0,
    postedBy: "TEST_RUNNER",
  });

  const afterPay1 = await prisma.folio.findUnique({ where: { id: folio.id } });
  assert.ok(afterPay1);
  assert.equal(afterPay1.totalPaid, initialPaid + 1000, "Paid amount should increment by ₹1,000");

  // 3. Add Split Payment 2 (₹575 UPI)
  const payment2 = await addFolioItem({
    folioId: folio.id,
    itemType: FolioItemType.PAYMENT,
    description: "TEST Settlement UPI Payment",
    quantity: 1,
    unitPrice: 575,
    amount: 575,
    taxRate: 0,
    taxAmount: 0,
    postedBy: "TEST_RUNNER",
  });

  const afterPay2 = await prisma.folio.findUnique({ where: { id: folio.id } });
  assert.ok(afterPay2);
  assert.equal(afterPay2.totalPaid, initialPaid + 1575, "Paid amount should increment by ₹1,575");
  assert.equal(
    afterPay2.balanceAmount,
    Math.round((afterPay2.totalCharges + afterPay2.totalTaxes - afterPay2.totalDiscounts - afterPay2.totalPaid) * 100) / 100,
    "Balance must strictly equal (Charges + Taxes - Discounts) - Paid"
  );

  // Cleanup test items
  await prisma.folioItem.deleteMany({
    where: { id: { in: [roomServiceItem.id, payment1.id, payment2.id] } },
  });
  await recalculateFolioTotals(folio.id);

  console.log("✔ Folio Ledger & Split Payments: ALL LEDGER BALANCES VERIFIED");
}

testFolioLedger()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Folio Test Failed:", err);
    process.exit(1);
  });
