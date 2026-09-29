import type { Metadata } from "next";
import { Suspense } from "react";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import DedicatedBookingEngine from "@/components/DedicatedBookingEngine";
import { getCanonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Book Online | Hotel Rajhans International Bhagalpur",
  description:
    "Direct online room reservation for Hotel Rajhans International, Bhagalpur. Book AC Executive, AC Deluxe, or Royal Suite with instant confirmation and secure Cashfree payment.",
  alternates: {
    canonical: getCanonicalUrl("/booking"),
  },
  openGraph: {
    title: "Book Online | Hotel Rajhans International Bhagalpur",
    description:
      "Instant room reservation with guaranteed best rates and direct perks at Hotel Rajhans International.",
    url: getCanonicalUrl("/booking"),
    type: "website",
  },
};

export default function BookingPage() {
  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-12 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs items={[{ name: "Book Your Stay" }]} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
            Direct Reservation Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
            Online Room Reservation
          </h1>
          <p className="text-xs sm:text-sm text-cream-soft/80 max-w-xl">
            Select your room category, check-in dates, and complete your reservation with instant confirmation.
          </p>
        </div>
      </section>

      {/* Booking Form in Suspense */}
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto px-6 py-20 text-center text-brown-800 text-sm">
            Loading reservation portal...
          </div>
        }
      >
        <DedicatedBookingEngine />
      </Suspense>
    </PublicLayout>
  );
}
