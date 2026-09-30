import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hotel Rajhans International | Hotel in Bhagalpur, Bihar",
    template: "%s",
  },
  description:
    "Rooms, fine dining, and parking at Kachari Chowk, MG Road, Bhagalpur. AC Executive, AC Deluxe, and Royal Suite rooms. ISO 9001:2015 certified.",
  keywords: [
    "Hotel Rajhans International",
    "Hotel in Bhagalpur",
    "Hotel in Bhagalpur Bihar",
    "Rooms in Bhagalpur",
    "AC rooms in Bhagalpur",
    "Royal Suite in Bhagalpur",
    "Hotel near Bhagalpur Junction",
    "Hotel near MG Road Bhagalpur",
    "Takshshila Restaurant",
    "Takshshila Regency",
  ],
  authors: [{ name: "Hotel Rajhans International" }],
  openGraph: {
    title: "Hotel Rajhans International | Hotel in Bhagalpur, Bihar",
    description:
      "Premier luxury hotel at Kachari Chowk, MG Road, Bhagalpur. AC Executive, AC Deluxe, and Royal Suite accommodation with Takshshila Restaurant.",
    url: siteUrl,
    siteName: "Hotel Rajhans International",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel Rajhans International | Hotel in Bhagalpur, Bihar",
    description:
      "Premier hotel in Bhagalpur, Bihar offering Executive, Deluxe, and Royal Suite accommodation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-gold-50 selection:bg-gold-300 selection:text-brown-900 font-sans">
        {children}
      </body>
    </html>
  );
}
