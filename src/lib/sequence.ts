import { prisma } from "@/lib/prisma";

/**
 * Concurrency-safe unique sequence generator using PostgreSQL atomic updates.
 * Guarantees zero duplicate references even under 100+ simultaneous requests.
 */
export async function getNextSequenceValue(name: string, prefix: string = ""): Promise<string> {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Atomic increment in PostgreSQL
  const sequence = await prisma.systemSequence.upsert({
    where: { name },
    update: {
      currentVal: { increment: 1 },
    },
    create: {
      name,
      prefix,
      currentVal: 1001,
    },
  });

  const seqStr = String(sequence.currentVal).padStart(4, "0");
  return `${prefix ? `${prefix}-` : ""}${dateStr}-${seqStr}`;
}

export async function generateSafeBookingReference(): Promise<string> {
  return await getNextSequenceValue("BOOKING_REF", "HRJ");
}

export async function generateSafeFolioNumber(): Promise<string> {
  return await getNextSequenceValue("FOLIO_NUM", "FOL");
}

export async function generateSafeOrderNumber(prefix: string = "RES"): Promise<string> {
  return await getNextSequenceValue(`ORDER_${prefix}`, prefix);
}
