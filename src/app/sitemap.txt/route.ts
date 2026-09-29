import { NextResponse } from "next/server";
import { HOTEL_INFO } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 86400; // Cache 24 hours

export async function GET() {
  const baseUrl = HOTEL_INFO.url;

  const urls = [
    `${baseUrl}`,
    `${baseUrl}/rooms`,
    `${baseUrl}/rooms/ac-executive`,
    `${baseUrl}/rooms/ac-deluxe`,
    `${baseUrl}/rooms/royal-suite`,
    `${baseUrl}/services`,
    `${baseUrl}/services/room-service`,
    `${baseUrl}/services/restaurant`,
    `${baseUrl}/services/laundry`,
    `${baseUrl}/services/wifi`,
    `${baseUrl}/restaurant`,
    `${baseUrl}/facilities`,
    `${baseUrl}/gallery`,
    `${baseUrl}/location`,
    `${baseUrl}/attractions`,
    `${baseUrl}/attractions/vikramshila`,
    `${baseUrl}/attractions/mandar-hill`,
    `${baseUrl}/about`,
    `${baseUrl}/reviews`,
    `${baseUrl}/faq`,
    `${baseUrl}/booking`,
    `${baseUrl}/contact`,
    `${baseUrl}/privacy-policy`,
    `${baseUrl}/terms-and-conditions`,
    `${baseUrl}/cancellation-policy`,
  ];

  return new NextResponse(urls.join("\n") + "\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
