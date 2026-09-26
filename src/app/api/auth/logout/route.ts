import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const revalidate = 0;

export async function POST() {
  await clearSessionCookie();
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete("rajhans_admin_token");
  response.cookies.delete("admin_token");
  response.cookies.delete("token");
  return response;
}
