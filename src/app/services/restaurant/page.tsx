import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  UtensilsCrossed,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Takshshila Restaurant Dining Service | Hotel Rajhans International",
  description:
    "Discover on-site dining at Takshshila Restaurant in Hotel Rajhans International, Bhagalpur. North Indian, Chinese, Continental cuisine, and in-room dining services.",
  alternates: {
    canonical: getCanonicalUrl("/services/restaurant"),
  },
  openGraph: {
    title: "Takshshila Restaurant Dining Service | Hotel Rajhans International",
    description:
      "On-site fine dining and in-room catering by Takshshila Restaurant at Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/services/restaurant"),
    type: "website",
  },
};

export default function ServicesRestaurantPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-12 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[
                { name: "Services", url: "/services" },
                { name: "Takshshila Restaurant", url: "/services/restaurant" },
              ]}
              currentUrl="/services/restaurant"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
            In-House Fine Dining
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Takshshila Restaurant Service
          </h1>
          <p className="text-xs sm:text-sm text-cream-soft/80 max-w-xl">
            A celebrated culinary landmark inside Hotel Rajhans International serving guests and visitors in Bhagalpur.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/restaurant/R002.jpg"
                alt="Takshshila Restaurant Dining Space at Hotel Rajhans International"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Culinary Heritage & Exceptional Flavors
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Takshshila Restaurant is the culinary heart of Hotel Rajhans International. Located
                on the ground floor, it caters to hotel residents through prompt in-room dining as
                well as walk-in guests looking for fine family dining in Bhagalpur.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Our chefs craft an eclectic repertoire ranging from aromatic North Indian gravies,
                tender tandoori specialties, zesty Indo-Chinese stir-fries, and traditional wholesome
                Bihari thalis. For a complete dining overview, photos, and group inquiries, visit our
                dedicated restaurant page.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/restaurant"
                className="px-6 py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Visit Main Restaurant Page</span>
                <ArrowRight className="h-4 w-4 text-gold-400" />
              </Link>
              <Link
                href="/services/room-service"
                className="px-5 py-3 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
              >
                <span>24/7 Room Service Details</span>
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-2">
                Dining Hours & Location
              </h3>
              <div className="space-y-3 text-xs text-brown-800 mb-6">
                <div className="flex justify-between border-b border-brown-900/10 pb-2">
                  <span className="text-brown-600">Breakfast:</span>
                  <span className="font-semibold">07:00 AM – 10:30 AM</span>
                </div>
                <div className="flex justify-between border-b border-brown-900/10 pb-2">
                  <span className="text-brown-600">Lunch:</span>
                  <span className="font-semibold">12:30 PM – 03:30 PM</span>
                </div>
                <div className="flex justify-between border-b border-brown-900/10 pb-2">
                  <span className="text-brown-600">Dinner:</span>
                  <span className="font-semibold">07:30 PM – 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-600">In-Room Dining:</span>
                  <span className="font-semibold text-gold-800">24 Hours Open</span>
                </div>
              </div>

              <a
                href={`tel:${HOTEL_INFO.telephone}`}
                className="w-full py-2.5 rounded-xl border border-brown-900/30 hover:bg-brown-900/5 text-brown-900 font-semibold text-xs text-center block transition-colors mb-2"
              >
                Table Reservation: {HOTEL_INFO.telephone}
              </a>
              <Link
                href="/services"
                className="w-full py-2 rounded-xl text-brown-800 hover:text-brown-950 text-xs font-semibold text-center block hover:underline"
              >
                ← Back to All Services
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
