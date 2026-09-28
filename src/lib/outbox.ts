import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendEmailNotification } from "@/lib/mailer";
import { syncBookingToGoogleSheet } from "@/lib/googlesheets";
import { generateConfirmationEmailHTML } from "@/lib/invoice";

export async function queueOutboxEvent(
  eventType: string,
  payload: Record<string, unknown>,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  return await client.outboxEvent.create({
    data: {
      eventType,
      payload: payload as unknown as Prisma.InputJsonValue,
      status: "PENDING",
      retryCount: 0,
      maxRetries: 5,
    },
  });
}

/**
 * Worker to process pending outbox events asynchronously.
 * Guarantees external services (Sheets, SMTP) never block or roll back PostgreSQL transactions.
 */
export async function processOutboxBatch(batchSize: number = 10): Promise<{ processed: number; errors: number }> {
  const pendingEvents = await prisma.outboxEvent.findMany({
    where: {
      status: "PENDING",
      retryCount: { lt: 5 },
    },
    take: batchSize,
    orderBy: { createdAt: "asc" },
  });

  let processed = 0;
  let errors = 0;

  for (const event of pendingEvents) {
    try {
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: "PROCESSING" },
      });

      const payload = event.payload as Record<string, any>;

      switch (event.eventType) {
        case "BOOKING_CONFIRMED": {
          // 1. Send Email Notification
          if (payload.customerEmail || payload.referenceId) {
            try {
              const emailHtml = generateConfirmationEmailHTML({
                bookingReference: payload.referenceId,
                customerName: payload.customerName || "Valued Guest",
                customerPhone: payload.customerPhone || "N/A",
                customerEmail: payload.customerEmail || "N/A",
                roomName: payload.roomName || "Deluxe Room",
                checkIn: new Date(payload.checkIn),
                checkOut: new Date(payload.checkOut),
                guestsCount: payload.guestsCount || 2,
                roomsCount: 1,
                basePrice: payload.netAmount || 0,
                totalAmount: payload.totalAmount || 0,
                taxAmount: payload.taxAmount || 0,
                discountAmount: payload.discountAmount || 0,
                netAmount: payload.netAmount || 0,
                paidAmount: payload.paidAmount || payload.netAmount || 0,
                paymentStatus: "SUCCESS",
                paymentMethod: payload.paymentMethod || "Verified",
                gstin: "10AAAAA0000A1Z5",
                createdAt: new Date(),
                hotelAddress: "Kachari Chowk, MG Road, Bhagalpur, Bihar - 812001",
                hotelPhone: "+91 93081 89201 / +91 641 2400000",
                googleMapsUrl: "https://maps.app.goo.gl/77AAPZ7hRje8Nrmk9",
                railwayDistance: "Bhagalpur Junction Railway Station (BGP): ~2.5 km (10-15 mins drive)",
              });

              const recipients = Array.from(
                new Set([
                  payload.customerEmail,
                  "info@hotelrajhansinternational.com",
                  "rajhansinternational.info@gmail.com",
                ].filter(Boolean))
              ).join(", ");

              await sendEmailNotification({
                to: recipients,
                subject: `Confirmed Booking (${payload.referenceId}) - Hotel Rajhans International`,
                html: emailHtml,
              });
            } catch (mailErr) {
              console.warn("Outbox email dispatch notice:", mailErr);
            }
          }

          // 2. Sync to Google Sheets
          try {
            await syncBookingToGoogleSheet({
              bookingReference: payload.referenceId,
              bookingDate: new Date(),
              customerName: payload.customerName || "Guest",
              phone: payload.customerPhone || "N/A",
              email: payload.customerEmail || "",
              roomName: payload.roomName || "Room",
              checkIn: new Date(payload.checkIn),
              checkOut: new Date(payload.checkOut),
              guestsCount: payload.guestsCount || 2,
              netAmount: payload.netAmount || 0,
              paymentStatus: "SUCCESS",
              bookingStatus: "CONFIRMED",
            });
          } catch (sheetErr) {
            console.warn("Outbox Google Sheets sync notice:", sheetErr);
          }
          break;
        }

        case "CHECK_IN":
        case "CHECK_OUT":
        case "BOOKING_CANCELLED": {
          // Sync operational status update if needed
          break;
        }
      }

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
        },
      });

      processed++;
    } catch (err: any) {
      errors++;
      const nextRetry = event.retryCount + 1;
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: nextRetry >= event.maxRetries ? "FAILED" : "PENDING",
          retryCount: nextRetry,
          lastError: err?.message || String(err),
        },
      });
    }
  }

  return { processed, errors };
}
