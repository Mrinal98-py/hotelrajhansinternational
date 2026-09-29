import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  Wifi,
  Wind,
  UtensilsCrossed,
  BellRing,
  ShieldCheck,
  Clock,
  Car,
  Tv,
  CheckCircle2,
  Building,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hotel Facilities in Bhagalpur | Hotel Rajhans International",
  description:
    "Explore modern hotel facilities at Hotel Rajhans International, Bhagalpur. Air-conditioned rooms, Takshshila Restaurant, 24-hour reception, monitored parking, and high-speed Wi-Fi.",
  alternates: {
    canonical: getCanonicalUrl("/facilities"),
  },
  openGraph: {
    title: "Hotel Facilities | Hotel Rajhans International Bhagalpur",
    description:
      "Comprehensive amenities and hotel facilities for business, leisure, and family travelers at Kachari Chowk, MG Road, Bhagalpur.",
    url: getCanonicalUrl("/facilities"),
    type: "website",
  },
};

const FACILITIES = [
  {
    title: "Takshshila Fine Dining Restaurant",
    category: "Dining & Cuisine",
    description:
      "Air-conditioned on-site multi-cuisine restaurant serving authentic North Indian, Mughlai, Chinese, and regional specialties with fresh ingredient sourcing.",
    icon: UtensilsCrossed,
    link: "/restaurant",
    linkText: "Explore Takshshila Restaurant",
    image: "/images/restaurant/R001.jpg",
  },
  {
    title: "24-Hour Room Service & Dining",
    category: "Guest Convenience",
    description:
      "Round-the-clock food and beverage delivery directly to guest rooms. Ideal for late railway arrivals and early morning departures.",
    icon: BellRing,
    link: "/services/room-service",
    linkText: "View Room Service Details",
    image: "/images/suite/SR001.jpg",
  },
  {
    title: "High-Speed Enterprise Wi-Fi",
    category: "Connectivity",
    description:
      "Complimentary fiber-optic internet connection across all 33 physical rooms, executive suites, restaurant, and lobby.",
    icon: Wifi,
    link: "/services/wifi",
    linkText: "Learn About Wi-Fi Network",
    image: "/images/executive/Room-002.jpg",
  },
  {
    title: "Secure Monitored On-Premises Parking",
    category: "Safety & Security",
    description:
      "Spacious and dedicated on-site parking lot monitored by surveillance cameras for guests arriving with private vehicles.",
    icon: Car,
    image: "/images/reception/Reception001.jpg",
  },
  {
    title: "24/7 Front Desk & Reception",
    category: "Guest Relations",
    description:
      "Warm concierge care, express check-in and check-out, luggage assistance, and local excursion coordination throughout the day and night.",
    icon: Clock,
    link: "/contact",
    linkText: "Contact Front Desk",
    image: "/images/reception/Reception002.jpg",
  },
  {
    title: "Climate-Controlled Air Conditioning",
    category: "Room Features",
    description:
      "All physical rooms are equipped with individual remote-controlled silent split air-conditioning units for customized cooling comfort.",
    icon: Wind,
    link: "/rooms",
    linkText: "Browse Air-Conditioned Rooms",
    image: "/images/deluxe/Delux001.jpg",
  },
  {
    title: "Laundry & Professional Pressing",
    category: "Housekeeping Care",
    description:
      "Same-day washing, dry cleaning, and crisp steam ironing service to keep business suits, sarees, and casual attire immaculate.",
    icon: ShieldCheck,
    link: "/services/laundry",
    linkText: "View Laundry Options",
    image: "/images/executive/Room-003.jpg",
  },
  {
    title: "Railway Station Transfer Assistance",
    category: "Mobility & Transport",
    description:
      "Pre-arranged AC cab transfers to and from Bhagalpur Junction (BGP) located just minutes from the hotel premises.",
    icon: Building,
    link: "/location",
    linkText: "View Location & Transit Info",
    image: "/images/reception/Reception003.jpg",
  },
];

export default function FacilitiesPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs items={[{ name: "Facilities" }]} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Comfort & Convenience
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Hotel Facilities in Bhagalpur
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Designed to ensure effortless productivity for business delegates and restful comfort
            for leisure families visiting Bhagalpur, Bihar.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FACILITIES.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <article
                key={idx}
                className="bg-cream-soft rounded-2xl border border-brown-900/10 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 w-full">
                    <Image
                      src={fac.image}
                      alt={fac.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-brown-950/80 text-gold-400 backdrop-blur-md border border-gold-400/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brown-600 font-bold block mb-1">
                      {fac.category}
                    </span>
                    <h2 className="font-serif text-xl font-bold text-brown-950 mb-2">
                      {fac.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-brown-800/90 leading-relaxed mb-4">
                      {fac.description}
                    </p>
                  </div>
                </div>

                {fac.link && (
                  <div className="p-6 pt-0">
                    <Link
                      href={fac.link}
                      className="text-xs font-bold text-brown-900 hover:text-brown-700 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>{fac.linkText}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-gold-600" />
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="bg-brown-950 text-cream py-12 px-6 border-t border-gold-400/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Experience Our Complete Hospitality
            </h3>
            <p className="text-xs sm:text-sm text-cream-soft/80">
              Book your room directly online for guaranteed availability and instant confirmation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-brown-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Book Stay</span>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
