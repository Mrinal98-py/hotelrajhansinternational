import { NextResponse } from "next/server";
import { getCanonicalUrl } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 86400; // Cache 24 hours

export async function GET() {
  const paths = [
    "/",
    "/rooms",
    "/rooms/ac-executive",
    "/rooms/ac-deluxe",
    "/rooms/royal-suite",
    "/services",
    "/services/room-service",
    "/services/restaurant",
    "/services/laundry",
    "/services/wifi",
    "/restaurant",
    "/facilities",
    "/gallery",
    "/location",
    "/attractions",
    "/attractions/vikramshila",
    "/attractions/mandar-hill",
    "/about",
    "/reviews",
    "/faq",
    "/booking",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cancellation-policy",
  ];

  const urls = paths.map((p) => getCanonicalUrl(p));

  return new NextResponse(urls.join("\n") + "\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
