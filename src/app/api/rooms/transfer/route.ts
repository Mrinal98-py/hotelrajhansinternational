import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, requireAuth } from "@/lib/security";
import { transferPhysicalRoomAtomic } from "@/lib/inventory";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER", "RECEPTION"]);
    if (auth.errorResponse) return auth.errorResponse;
    const currentStaff = auth.session;

    const body = await request.json().catch(() => ({}));
    const { bookingId, toPhysicalRoomId, reason, notes } = body;

    if (!bookingId || !toPhysicalRoomId) {
      return apiError(
        "VALIDATION_ERROR",
        "bookingId and toPhysicalRoomId are required",
        400
      );
    }

    const result = await transferPhysicalRoomAtomic({
      bookingId,
      toPhysicalRoomId,
      reason,
      notes,
      performedBy: currentStaff.name,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/room-inventory");
    revalidatePath("/admin/dashboard");

    return apiSuccess({
      message: `Room transferred successfully from ${result.fromRoomNumber} to ${result.toRoomNumber}`,
      transfer: result.transfer,
    });
  } catch (error: any) {
    console.error("Room Transfer API Error:", error);
    return apiError(
      "CONFLICT",
      error?.message || "Failed to execute room transfer",
      409
    );
  }
}
