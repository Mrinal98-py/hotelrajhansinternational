import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  UtensilsCrossed,
  BellRing,
  Shirt,
  Wifi,
  Car,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hotel Services in Bhagalpur | Hotel Rajhans International",
  description:
    "Explore guest services at Hotel Rajhans International, Bhagalpur. 24/7 room service, Takshshila Restaurant, laundry & pressing, high-speed Wi-Fi, and railway transfers.",
  alternates: {
    canonical: getCanonicalUrl("/services"),
  },
  openGraph: {
    title: "Hotel Services in Bhagalpur | Hotel Rajhans International",
    description:
      "Comprehensive hospitality services including 24/7 room dining, laundry, fine cuisine, and high-speed internet at Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/services"),
    type: "website",
  },
};

const SERVICES = [
  {
    slug: "room-service",
    title: "24/7 Room Service",
    subtitle: "In-Room Dining Round the Clock",
    description:
      "Order hot and freshly prepared delicacies directly to your room at any hour of the day or night. Featuring an extensive menu of Indian, Chinese, and regional specialties.",
    image: "/images/restaurant/R001.jpg",
    icon: BellRing,
    href: "/services/room-service",
    highlights: ["24-Hour Availability", "Freshly Cooked Meals", "Beverages & Snacks", "Contactless Tray Delivery"],
  },
  {
    slug: "restaurant",
    title: "Takshshila Restaurant",
    subtitle: "Fine Dining & Family Cuisine",
    description:
      "Bhagalpur's celebrated family dining venue serving authentic North Indian, Mughlai, Chinese, and traditional Bihari delicacies with dedicated hospitality.",
    image: "/images/restaurant/R002.jpg",
    icon: UtensilsCrossed,
    href: "/restaurant",
    highlights: ["Multi-Cuisine Selections", "Hygienic Clean Kitchen", "Family Seating & Banqueting", "Special Thali Options"],
  },
  {
    slug: "laundry",
    title: "Laundry & Dry Cleaning",
    subtitle: "Same-Day Garment Care",
    description:
      "Fast, professional washing, dry cleaning, and crisp steam ironing service for business attire, formal suits, and casual clothes.",
    image: "/images/suite/SR003.jpg",
    icon: Shirt,
    href: "/services/laundry",
    highlights: ["Same-Day Turnaround", "Steam Pressing", "Garment Care Guarantee", "In-Room Collection"],
  },
  {
    slug: "wifi",
    title: "High-Speed Wi-Fi",
    subtitle: "Enterprise-Grade Broadband",
    description:
      "Complimentary seamless wireless connectivity across all guest rooms, restaurant, and public lobbies. Ideal for virtual conferences and video streaming.",
    image: "/images/executive/Room-002.jpg",
    icon: Wifi,
    href: "/services/wifi",
    highlights: ["Complimentary for Guests", "High-Bandwidth Fiber", "Full Room Coverage", "24/7 Network Uptime"],
  },
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[{ name: "Services", url: "/services" }]}
              currentUrl="/services"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Hospitality & Facilities
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Guest Services & Hospitality in Bhagalpur
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            At Hotel Rajhans International, every aspect of your stay is supported by dedicated
            front-of-house and back-of-house teams ensuring prompt care, pristine hygiene, and comfort.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((serv) => {
            const Icon = serv.icon;
            return (
              <article
                key={serv.slug}
                className="bg-cream-soft rounded-2xl border border-brown-900/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 w-full">
                    <Image
                      src={serv.image}
                      alt={serv.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-brown-950/80 text-gold-400 backdrop-blur-md border border-gold-400/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="p-6 sm:p-7">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-brown-600 font-bold block mb-1">
                      {serv.subtitle}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                      <Link href={serv.href} className="hover:text-brown-700 transition-colors">
                        {serv.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-brown-800/90 leading-relaxed mb-6">
                      {serv.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-brown-900">
                      {serv.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-gold-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={serv.href}
                    className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Explore Service Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Additional On-Demand Services */}
      <section className="bg-cream/60 border-t border-brown-900/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-6 text-center">
            Additional On-Demand Guest Support
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
              <div className="flex items-center gap-2 text-brown-950 font-bold text-sm">
                <Car className="h-4 w-4 text-brown-700" />
                <span>Station Pickup & Drop</span>
              </div>
              <p className="text-xs text-brown-700 leading-relaxed">
                Direct AC cab transfers to and from Bhagalpur Junction (BGP) railway station at ₹350 per trip.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
              <div className="flex items-center gap-2 text-brown-950 font-bold text-sm">
                <Clock className="h-4 w-4 text-brown-700" />
                <span>24-Hour Front Desk</span>
              </div>
              <p className="text-xs text-brown-700 leading-relaxed">
                Express check-in, late arrivals assistance, luggage holding, and local travel recommendations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
              <div className="flex items-center gap-2 text-brown-950 font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-brown-700" />
                <span>Secure Monitored Parking</span>
              </div>
              <p className="text-xs text-brown-700 leading-relaxed">
                Complimentary monitored parking area on premises for four-wheelers and two-wheelers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
