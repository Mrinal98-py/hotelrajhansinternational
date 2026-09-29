import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO, generateHotelSchema } from "@/lib/seo";
import {
  ShieldCheck,
  Building,
  Award,
  MapPin,
  UtensilsCrossed,
  BedDouble,
  HeartHandshake,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Hotel Rajhans International Bhagalpur",
  description:
    "Learn about Hotel Rajhans International (a unit of Takshshila Regency Pvt. Ltd.) in Bhagalpur, Bihar. ISO 9001:2015 certified hospitality, 33 premium rooms, fine dining, and prime MG Road location.",
  alternates: {
    canonical: getCanonicalUrl("/about"),
  },
  openGraph: {
    title: "About Hotel Rajhans International | Bhagalpur, Bihar",
    description:
      "A trusted name in Bhagalpur hospitality. Providing 33 air-conditioned rooms, Takshshila Restaurant, and genuine guest care at Kachari Chowk.",
    url: getCanonicalUrl("/about"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/reception/Reception001.jpg`,
        width: 1200,
        height: 800,
        alt: "Hotel Rajhans International Reception and Hospitality",
      },
    ],
  },
};

export default function AboutPage() {
  const hotelSchema = generateHotelSchema();

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs items={[{ name: "About Hotel" }]} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Heritage & Hospitality
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            About Hotel Rajhans International
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            A premier hospitality destination in Bhagalpur managed by Takshshila Regency Pvt. Ltd.
            Committed to exemplary service, pristine hygiene, and authentic Indian hospitality.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/reception/Reception001.jpg"
                alt="Hotel Rajhans International Grand Lobby & Reception"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Warmth, Comfort & Excellence in Bhagalpur
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Established as an enterprise of Takshshila Regency Pvt. Ltd., Hotel Rajhans
                International stands prominently at Kachari Chowk on Mahatma Gandhi (MG) Road,
                right at the commercial and administrative epicenter of Bhagalpur.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Our property is ISO 9001:2015 certified, reflecting our rigorous adherence to
                quality management systems, spotless sanitation standards, and customer-first
                service delivery. Whether hosting corporate executives visiting district headquarters,
                families attending auspicious wedding celebrations, or cultural tourists exploring
                the historical Pala Empire ruins, we provide a peaceful, secure retreat.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                With exactly 33 well-appointed physical rooms across AC Executive, AC Deluxe, and
                Royal Suite categories, we ensure personalized attention that larger corporate chain
                hotels often overlook.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
                <div className="flex items-center gap-2 text-brown-950 font-bold text-sm">
                  <Award className="h-4 w-4 text-gold-700" />
                  <span>ISO 9001:2015 Certified</span>
                </div>
                <p className="text-xs text-brown-700 leading-relaxed">
                  Stringent international benchmarks for hospitality quality, guest safety, housekeeping, and operational cleanliness.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
                <div className="flex items-center gap-2 text-brown-950 font-bold text-sm">
                  <MapPin className="h-4 w-4 text-gold-700" />
                  <span>Prime Central Location</span>
                </div>
                <p className="text-xs text-brown-700 leading-relaxed">
                  Walking distance to district courts, financial institutions, and just 2 km from Bhagalpur Junction (BGP) railway station.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
                <div className="flex items-center gap-2 text-brown-950 font-bold text-sm">
                  <UtensilsCrossed className="h-4 w-4 text-gold-700" />
                  <span>Takshshila Fine Dining</span>
                </div>
                <p className="text-xs text-brown-700 leading-relaxed">
                  Authentic North Indian, Mughlai, Chinese, and regional specialties served fresh from our master kitchen round the clock.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
                <div className="flex items-center gap-2 text-brown-950 font-bold text-sm">
                  <ShieldCheck className="h-4 w-4 text-gold-700" />
                  <span>Secure & Monitored</span>
                </div>
                <p className="text-xs text-brown-700 leading-relaxed">
                  24/7 CCTV surveillance, monitored private guest parking, and round-the-clock front desk team on premises.
                </p>
              </div>
            </div>

            {/* Entity Details */}
            <div className="p-6 rounded-2xl bg-white border border-brown-900/10 space-y-3">
              <h3 className="font-serif text-base font-bold text-brown-950">
                Corporate & Property Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-brown-800">
                <div>
                  <span className="font-semibold text-brown-950 block">Operating Company:</span>
                  <span>Takshshila Regency Pvt. Ltd.</span>
                </div>
                <div>
                  <span className="font-semibold text-brown-950 block">Property Name:</span>
                  <span>Hotel Rajhans International</span>
                </div>
                <div>
                  <span className="font-semibold text-brown-950 block">Location:</span>
                  <span>Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001</span>
                </div>
                <div>
                  <span className="font-semibold text-brown-950 block">Room Inventory:</span>
                  <span>33 Physical Guest Rooms (Executive, Deluxe, Royal Suite)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-3">
                Experience Our Hospitality
              </h3>
              <p className="text-xs text-brown-700 mb-6 leading-relaxed">
                Planning a trip to the Silk City of Bhagalpur? Reserve your room directly for best rates.
              </p>

              <div className="space-y-3">
                <Link
                  href="/booking"
                  className="w-full py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center block shadow-sm transition-colors"
                >
                  Book Your Stay
                </Link>
                <Link
                  href="/rooms"
                  className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center block transition-colors"
                >
                  Browse Rooms & Suites
                </Link>
                <Link
                  href="/restaurant"
                  className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center block transition-colors"
                >
                  Takshshila Restaurant
                </Link>
                <Link
                  href="/contact"
                  className="w-full py-2 rounded-xl text-brown-800 hover:text-brown-950 text-xs font-semibold text-center block"
                >
                  Contact & Inquiries →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
