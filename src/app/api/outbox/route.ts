import { NextResponse } from "next/server";
import { processOutboxBatch } from "@/lib/outbox";
import { apiSuccess, apiError } from "@/lib/security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Optional secret check if cron invokes it
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return apiError("UNAUTHORIZED", "Invalid cron authorization secret", 401);
    }

    const result = await processOutboxBatch(20);
    return apiSuccess({
      message: `Processed ${result.processed} outbox events (${result.errors} errors)`,
      ...result,
    });
  } catch (error: any) {
    console.error("Outbox Processing Error:", error);
    return apiError("EXTERNAL_SERVICE_ERROR", error?.message || "Failed to process outbox", 500);
  }
}

export async function GET(request: Request) {
  return POST(request);
}
