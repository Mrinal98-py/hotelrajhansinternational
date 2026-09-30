import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  BellRing,
  Clock,
  UtensilsCrossed,
  Phone,
  CheckCircle2,
  CalendarCheck,
  Coffee,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "24/7 Room Service in Bhagalpur | Hotel Rajhans International",
  description:
    "Enjoy round-the-clock in-room dining at Hotel Rajhans International, Bhagalpur. Freshly cooked North Indian, Chinese, Mughlai, and Bihari cuisine delivered right to your room.",
  alternates: {
    canonical: getCanonicalUrl("/services/room-service"),
  },
  openGraph: {
    title: "24/7 In-Room Dining & Room Service | Hotel Rajhans International",
    description:
      "24-hour room service prepared hot and fresh from Takshshila Restaurant kitchen in Bhagalpur, Bihar.",
    url: getCanonicalUrl("/services/room-service"),
    type: "website",
  },
};

export default function RoomServicePage() {
  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-12 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[
                { name: "Services", url: "/services" },
                { name: "24/7 Room Service", url: "/services/room-service" },
              ]}
              currentUrl="/services/room-service"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
            Round-The-Clock In-Room Dining
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            24/7 Room Service in Bhagalpur
          </h1>
          <p className="text-xs sm:text-sm text-cream-soft/80 max-w-xl">
            Freshly prepared culinary selections delivered directly to your room from our master kitchen.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/restaurant/R001.jpg"
                alt="24/7 Room Service and Dining at Hotel Rajhans International"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Culinary Comfort Without Leaving Your Room
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Whether arriving late in the evening after an express train journey to Bhagalpur Junction
                or starting early with hot morning tea and breakfast, our dedicated room service team
                is available 24 hours a day. Every order is freshly prepared to order at Takshshila Restaurant.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Guests can browse the printed room service menu stationed on their study desk or dial
                our front desk intercom directly. From soothing soups and evening appetizers to rich
                paneer curries, biryanis, and traditional Bihari specialties, your meal is delivered
                steaming hot with full tableware service.
              </p>
            </div>

            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                In-Room Dining Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-brown-900">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">24 Hours Continuous Service</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Early Morning Bed Tea & Breakfast</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Hygienic Sealed Food Covers</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Vegetarian & Non-Vegetarian Options</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Direct Dial Intercom Service</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Late Night Snacks & Beverages</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-2">
                Takshshila In-Room Service
              </h3>
              <p className="text-xs text-brown-700 mb-4 leading-relaxed">
                Available to all registered guests in Executive, Deluxe, and Royal Suite rooms.
              </p>

              <div className="space-y-3 mb-6">
                <Link
                  href="/restaurant"
                  className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center block transition-colors"
                >
                  View Restaurant & Menu
                </Link>
                <Link
                  href="/rooms"
                  className="w-full py-2.5 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center block transition-colors"
                >
                  Explore Rooms & Suites
                </Link>
                <Link
                  href="/services"
                  className="w-full py-2 rounded-xl text-brown-800 hover:text-brown-950 text-xs font-semibold text-center block hover:underline"
                >
                  ← Back to All Services
                </Link>
              </div>

              <div className="pt-4 border-t border-brown-900/10 text-xs text-brown-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brown-600" />
                  <span>Timings: 24 Hours / 7 Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brown-600" />
                  <span>Order via In-Room Intercom</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
