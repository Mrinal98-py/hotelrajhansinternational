import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hotel Rajhans International | Hotel in Bhagalpur, Bihar",
  description:
    "Rooms, fine dining, and parking at Kachari Chowk, MG Road, Bhagalpur. AC Executive, AC Deluxe, and Royal Suite rooms. Takshshila Restaurant & 24/7 room service. ISO 9001:2015 certified.",
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  openGraph: {
    title: "Hotel Rajhans International | Hotel in Bhagalpur, Bihar",
    description:
      "Premier luxury hotel at Kachari Chowk, MG Road, Bhagalpur. AC Executive, AC Deluxe, and Royal Suite accommodation with Takshshila Restaurant.",
    url: getCanonicalUrl("/"),
    siteName: HOTEL_INFO.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/reception/Reception001.jpg`,
        width: 1200,
        height: 800,
        alt: "Hotel Rajhans International Bhagalpur Reception and Luxury Rooms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel Rajhans International | Hotel in Bhagalpur, Bihar",
    description:
      "Premier hotel in Bhagalpur, Bihar offering Executive, Deluxe, and Royal Suite accommodation.",
    images: [`${HOTEL_INFO.url}/images/reception/Reception001.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return <HomeClient />;
}
