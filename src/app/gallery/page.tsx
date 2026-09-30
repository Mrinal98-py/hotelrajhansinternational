import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import GalleryClient from "@/components/GalleryClient";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import { CalendarCheck, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Photo Gallery | Hotel Rajhans International Bhagalpur",
  description:
    "Browse authentic high-resolution photographs of AC Executive rooms, AC Deluxe rooms, Royal Suites, Takshshila Restaurant, reception lobby, and facilities at Hotel Rajhans International, Bhagalpur.",
  alternates: {
    canonical: getCanonicalUrl("/gallery"),
  },
  openGraph: {
    title: "Photo Gallery | Hotel Rajhans International Bhagalpur",
    description:
      "Explore real interior photos of rooms, suites, fine dining, and hospitality spaces at Kachari Chowk, MG Road, Bhagalpur.",
    url: getCanonicalUrl("/gallery"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/suite/SR001.jpg`,
        width: 1200,
        height: 800,
        alt: "Hotel Rajhans International Photo Gallery",
      },
    ],
  },
};

export default function GalleryPage() {
  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[{ name: "Gallery", url: "/gallery" }]}
              currentUrl="/gallery"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Visual Experience
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Hotel Rajhans International Photo Gallery
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Take a visual tour through our guest accommodation, royal suites, Takshshila dining
            restaurant, front reception lounge, and on-premises facilities in Bhagalpur.
          </p>
        </div>
      </section>

      {/* Interactive Filterable Gallery */}
      <GalleryClient />

      {/* Direct Booking CTA */}
      <section className="bg-brown-950 text-cream py-12 px-6 border-t border-gold-400/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Like What You See? Book Directly With Us
            </h3>
            <p className="text-xs sm:text-sm text-cream-soft/80">
              Guaranteed availability, lowest price assurance, and instant room reservation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-brown-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Book Your Room</span>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
