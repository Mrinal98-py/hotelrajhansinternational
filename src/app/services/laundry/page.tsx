import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  Shirt,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Laundry & Dry Cleaning Services in Bhagalpur | Hotel Rajhans International",
  description:
    "Professional laundry, pressing, and dry cleaning services for guests at Hotel Rajhans International, Bhagalpur. Fast turnaround, careful garment care, and in-room delivery.",
  alternates: {
    canonical: getCanonicalUrl("/services/laundry"),
  },
  openGraph: {
    title: "Laundry & Dry Cleaning Services | Hotel Rajhans International",
    description:
      "Garment care, steam pressing, and dry cleaning at Hotel Rajhans International, Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/services/laundry"),
    type: "website",
  },
};

export default function LaundryServicePage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-12 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs
              items={[
                { name: "Services", url: "/services" },
                { name: "Laundry & Dry Cleaning" },
              ]}
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
            Garment Care & Pressing
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Laundry & Dry Cleaning Services
          </h1>
          <p className="text-xs sm:text-sm text-cream-soft/80 max-w-xl">
            Reliable same-day washing, dry cleaning, and steam pressing so you always look your best.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/executive/Room-003.jpg"
                alt="Hotel Rajhans Laundry and Wardrobe Amenities"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Professional Garment Care for Travelers
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Travel can be demanding on clothes. At Hotel Rajhans International, we provide
                comprehensive in-house laundry, dry cleaning, and steam ironing services tailored
                for corporate travelers, wedding attendees, and long-stay guests.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Simply place your garments in the laundry bag provided in your room wardrobe and notify
                housekeeping or the front desk. Garments collected in the morning are laundered, carefully
                inspected, crisply ironed on hangers, and returned promptly to your room.
              </p>
            </div>

            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Service Features & Rates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-brown-900 mb-6">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Same-Day Express Laundry Available</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Gentle Fabric Dry Cleaning</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Crisp Steam Pressing on Hangers</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Direct In-Room Pick-up & Delivery</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-brown-900/10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brown-950">Standard Item Laundering & Pressing:</span>
                  <span className="font-mono font-bold text-brown-950">₹150 / item (excl. 18% GST)</span>
                </div>
                <p className="text-[11px] text-brown-600 mt-1">
                  Full tariff sheet for suits, traditional sarees, and heavy woolens available inside each room.
                </p>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-2">
                Request Laundry Service
              </h3>
              <p className="text-xs text-brown-700 mb-4 leading-relaxed">
                Contact housekeeping using your in-room telephone or speak with our front desk.
              </p>

              <a
                href={`tel:${HOTEL_INFO.telephone}`}
                className="w-full py-2.5 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center block transition-colors mb-3"
              >
                Call Front Desk: {HOTEL_INFO.telephone}
              </a>

              <Link
                href="/rooms"
                className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center block transition-colors"
              >
                Browse Rooms
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
