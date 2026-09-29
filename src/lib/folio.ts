import { prisma } from "@/lib/prisma";
import { Prisma, FolioItemType, FolioStatus } from "@prisma/client";
import { generateSafeFolioNumber } from "@/lib/sequence";

export interface CreateFolioItemParams {
  folioId: string;
  itemType: FolioItemType;
  description: string;
  quantity?: number;
  unitPrice: number;
  amount?: number;
  taxRate?: number;
  taxAmount?: number;
  referenceId?: string;
  postedBy?: string;
}

/**
 * Creates or gets the folio for a given booking.
 */
export async function getOrCreateFolio(
  bookingId: string,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  let folio = await client.folio.findUnique({
    where: { bookingId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });

  if (!folio) {
    const booking = await client.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const folioNumber = await generateSafeFolioNumber();
    folio = await client.folio.create({
      data: {
        bookingId,
        folioNumber,
        status: FolioStatus.OPEN,
        totalCharges: 0,
        totalTaxes: 0,
        totalDiscounts: 0,
        totalPaid: 0,
        balanceAmount: 0,
      },
      include: { items: true },
    });

    // Automatically post initial room charges and taxes from booking
    if (booking.totalAmount > 0) {
      await addFolioItem(
        {
          folioId: folio.id,
          itemType: FolioItemType.ROOM_CHARGE,
          description: `Room Tariff Accommodation Charges`,
          quantity: 1,
          unitPrice: booking.totalAmount,
          taxRate: booking.appliedTaxRate || 12,
          taxAmount: booking.taxAmount,
          postedBy: "Front Desk System",
        },
        client
      );
    }

    // Automatically post any already recorded paid amount
    if (booking.paidAmount > 0) {
      await addFolioItem(
        {
          folioId: folio.id,
          itemType: FolioItemType.PAYMENT,
          description: "Advance / Confirmed Payment Received",
          quantity: 1,
          unitPrice: booking.paidAmount,
          taxRate: 0,
          taxAmount: 0,
          postedBy: "Payment Processing",
        },
        client
      );
    }

    // Refetch with recalculated numbers
    folio = await client.folio.findUnique({
      where: { id: folio.id },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
  }

  return folio!;
}

/**
 * Adds an itemized charge, payment, tax, discount, or refund to a folio and recalculates balance atomically.
 */
export async function addFolioItem(
  params: CreateFolioItemParams,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  const qty = params.quantity || 1;
  const itemAmount = params.amount !== undefined ? params.amount : params.unitPrice * qty;
  const taxRate = params.taxRate || 0;
  const taxAmount =
    params.taxAmount !== undefined
      ? params.taxAmount
      : Math.round(((itemAmount * taxRate) / 100) * 100) / 100;

  const item = await client.folioItem.create({
    data: {
      folioId: params.folioId,
      itemType: params.itemType,
      description: params.description,
      quantity: qty,
      unitPrice: params.unitPrice,
      amount: itemAmount,
      taxRate,
      taxAmount,
      referenceId: params.referenceId,
      postedBy: params.postedBy || "Staff",
    },
  });

  // Recalculate totals dynamically
  await recalculateFolioTotals(params.folioId, client);

  return item;
}

/**
 * Dynamically computes total charges, taxes, discounts, payments, refunds and balance from DB items.
 * Ensures PostgreSQL is the single source of truth with zero hardcoding.
 */
export async function recalculateFolioTotals(
  folioId: string,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  const items = await client.folioItem.findMany({
    where: { folioId },
  });

  let totalCharges = 0;
  let totalTaxes = 0;
  let totalDiscounts = 0;
  let totalPaid = 0;

  for (const item of items) {
    switch (item.itemType) {
      case FolioItemType.ROOM_CHARGE:
      case FolioItemType.RESTAURANT:
      case FolioItemType.ROOM_SERVICE:
      case FolioItemType.LAUNDRY:
      case FolioItemType.MINIBAR:
      case FolioItemType.EXTRA_BED:
      case FolioItemType.SERVICE:
        totalCharges += item.amount;
        totalTaxes += item.taxAmount;
        break;

      case FolioItemType.TAX:
        totalTaxes += item.amount;
        break;

      case FolioItemType.DISCOUNT:
        totalDiscounts += item.amount;
        break;

      case FolioItemType.ADJUSTMENT:
        // Positive adjustment adds to charges, negative reduces
        if (item.amount >= 0) {
          totalCharges += item.amount;
        } else {
          totalDiscounts += Math.abs(item.amount);
        }
        break;

      case FolioItemType.PAYMENT:
        totalPaid += item.amount;
        break;

      case FolioItemType.REFUND:
        totalPaid -= item.amount; // A refund reduces total payments received
        break;

      case FolioItemType.REVERSAL:
        // Reversal offsets charges and taxes
        totalCharges -= item.amount;
        totalTaxes -= item.taxAmount;
        break;
    }
  }

  const balanceAmount =
    Math.round((totalCharges + totalTaxes - totalDiscounts - totalPaid) * 100) / 100;

  const updatedFolio = await client.folio.update({
    where: { id: folioId },
    data: {
      totalCharges: Math.round(totalCharges * 100) / 100,
      totalTaxes: Math.round(totalTaxes * 100) / 100,
      totalDiscounts: Math.round(totalDiscounts * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      balanceAmount,
      status: balanceAmount <= 0 ? FolioStatus.SETTLED : FolioStatus.OPEN,
    },
  });

  // Also synchronize Booking.paidAmount and Booking.netAmount
  await client.booking.update({
    where: { id: updatedFolio.bookingId },
    data: {
      paidAmount: updatedFolio.totalPaid,
      netAmount: Math.round((totalCharges + totalTaxes - totalDiscounts) * 100) / 100,
    },
  });

  return updatedFolio;
}

/**
 * Posts an immutable reversal of a previous folio item, preserving full audit history.
 */
export async function reverseFolioItem(params: {
  folioId: string;
  originalItemId: string;
  reason: string;
  reversedBy: string;
  tx?: Prisma.TransactionClient;
}) {
  const client = params.tx || prisma;
  const originalItem = await client.folioItem.findUnique({
    where: { id: params.originalItemId },
  });

  if (!originalItem) {
    throw new Error(`Folio item ${params.originalItemId} not found`);
  }

  if (originalItem.folioId !== params.folioId) {
    throw new Error("Item does not belong to the specified folio");
  }

  const reversalItem = await addFolioItem(
    {
      folioId: params.folioId,
      itemType: FolioItemType.REVERSAL,
      description: `REVERSAL of [${originalItem.description}] - Reason: ${params.reason}`,
      quantity: 1,
      unitPrice: originalItem.amount,
      amount: originalItem.amount,
      taxRate: originalItem.taxRate,
      taxAmount: originalItem.taxAmount,
      referenceId: originalItem.id,
      postedBy: params.reversedBy,
    },
    client
  );

  return reversalItem;
}

