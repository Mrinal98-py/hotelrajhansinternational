import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const revalidate = 0;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true, user: session }, { status: 200 });
}
