import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  MapPin,
  Clock,
  Landmark,
  Compass,
  ArrowRight,
  CalendarCheck,
  Building,
  Phone,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mandar Hill (Mandar Parvat) | Excursions from Hotel Rajhans Bhagalpur",
  description:
    "Visitor guide to Mandar Hill (Mandar Parvat) in Banka near Bhagalpur. Distance from Hotel Rajhans International (48 km), Samudra Manthan mythology, ropeway, Jain shrine, and Paparni Lake.",
  alternates: {
    canonical: getCanonicalUrl("/attractions/mandar-hill"),
  },
  openGraph: {
    title: "Mandar Hill Travel Guide | Hotel Rajhans International",
    description:
      "Explore sacred Mandar Parvat, Paparni Sarovar, and scenic mountain ropeway. Convenient day trip accommodation at Hotel Rajhans International, Bhagalpur.",
    url: getCanonicalUrl("/attractions/mandar-hill"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/attractions/mandar_hill.jpg`,
        width: 1200,
        height: 800,
        alt: "Mandar Hill Granite Monolith and Paparni Sarovar Lake",
      },
    ],
  },
};

export default function MandarHillPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs
              items={[
                { name: "Attractions", url: "/attractions" },
                { name: "Mandar Hill (Mandar Parvat)" },
              ]}
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Sacred Mythology & Geological Marvel
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Mandar Hill (Mandar Parvat)
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            The mythical churning rod of the cosmic ocean (Samudra Manthan), a sacred pilgrimage for
            Hindu and Jain devotees, situated 48 km south of Hotel Rajhans International.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/attractions/mandar_hill.jpg"
                alt="Scenic View of Mandar Hill and Holy Paparni Lake"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Mythological Legend & Spiritual Confluence
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Rising approximately 700 feet from the fertile plains of Bounsi in Banka district,
                Mandar Hill is a solitary monolithic granite formation holding immense spiritual
                significance. According to Puranic scripture, Mandar Parvat was used by the gods (Devas)
                and demons (Asuras) as the central churning rod during the churning of the cosmic
                ocean (Samudra Manthan) to extract the nectar of immortality (Amrit).
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                At the base of the hill rests the pristine Paparni Sarovar (sacred lake), where pilgrims
                take holy dips during the annual Makar Sankranti Mela. The hill is also holy to the Jain
                faith as the site where the 12th Tirthankara, Lord Vasupujya, attained Nirvana.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Visitors can ascend via paved rock-cut stairs or take the modern passenger ropeway
                offering aerial panoramic vistas across the verdant countryside, ancient rock sculptures
                of Lord Vishnu, and tranquil hill summit temples.
              </p>
            </div>

            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Excursion & Route Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-brown-900">
                <div className="p-3.5 bg-white rounded-xl border border-brown-900/10 space-y-1">
                  <span className="font-bold text-brown-950 block">Distance from Hotel:</span>
                  <span className="text-brown-700">Approx. 48 km south via SH 19 / Bounsi Highway</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-brown-900/10 space-y-1">
                  <span className="font-bold text-brown-950 block">Travel Duration:</span>
                  <span className="text-brown-700">1.5 hours by car or scenic local train from Bhagalpur</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-brown-900/10 space-y-1">
                  <span className="font-bold text-brown-950 block">Ropeway Facility:</span>
                  <span className="text-brown-700">Operational during daytime for effortless summit ascent</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-brown-900/10 space-y-1">
                  <span className="font-bold text-brown-950 block">Ideal Season:</span>
                  <span className="text-brown-700">September to March; famous Makar Sankranti fair in January</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brown-700 font-bold block mb-1">
                Day Trip Headquarters
              </span>
              <h3 className="font-serif text-xl font-bold text-brown-950 mb-2">
                Stay at Hotel Rajhans
              </h3>
              <p className="text-xs text-brown-700 mb-6 leading-relaxed">
                Start your early morning day trip to Mandar Hill refreshed. Located on MG Road with
                on-site secure car parking and early morning breakfast service.
              </p>

              <div className="space-y-3 mb-6">
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
                  View Rooms & Suites
                </Link>
                <Link
                  href="/attractions"
                  className="w-full py-2 rounded-xl text-brown-800 hover:text-brown-950 text-xs font-semibold text-center block"
                >
                  ← All Bhagalpur Attractions
                </Link>
              </div>

              <div className="pt-4 border-t border-brown-900/10 text-xs text-brown-800 space-y-1">
                <p className="font-semibold text-brown-950">Transport Coordination:</p>
                <p className="text-brown-600">
                  Our front desk can arrange direct taxi cabs for return day trips to Mandar Hill and Bounsi.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
