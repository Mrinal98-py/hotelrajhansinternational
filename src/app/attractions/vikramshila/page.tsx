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
  title: "Vikramshila Ancient University Ruins | Bhagalpur Guide | Hotel Rajhans",
  description:
    "Complete visitor guide to Vikramshila Ancient University ruins near Kahalgaon, Bhagalpur. Distance from Hotel Rajhans International (44 km), history, stupa excavation, and travel info.",
  alternates: {
    canonical: getCanonicalUrl("/attractions/vikramshila"),
  },
  openGraph: {
    title: "Vikramshila Ancient University Ruins | Bhagalpur Travel Guide",
    description:
      "Visit the 8th-century Buddhist university ruins founded by King Dharmapala. Stay comfortably at Hotel Rajhans International, Bhagalpur.",
    url: getCanonicalUrl("/attractions/vikramshila"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/attractions/vikramshila.jpg`,
        width: 1200,
        height: 800,
        alt: "Excavated Main Stupa and Monastic Complex of Vikramshila",
      },
    ],
  },
};

export default function VikramshilaPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs
              items={[
                { name: "Attractions", url: "/attractions" },
                { name: "Vikramshila University Ruins" },
              ]}
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Ancient Buddhist Heritage
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Vikramshila Ancient University Ruins
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            The grand 8th-century seat of international Buddhist scholarship founded by the Pala Empire,
            located 44 km east of Hotel Rajhans International near Kahalgaon.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/attractions/vikramshila.jpg"
                alt="Excavated Cruciform Stupa at Vikramshila University Ruins"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Historical Significance & Archaeological Splendor
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Established by the revered Pala King Dharmapala in the late 8th century, Vikramshila
                rose to prominence as one of the ancient world&apos;s foremost centers of Buddhist
                philosophy, grammar, metaphysics, logic, and Tantric studies. At its height, the
                monastery housed over a hundred teachers and thousands of scholars from Tibet, China,
                Sri Lanka, and Central Asia.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                The most remarkable feature of the excavated site at Antichak is the colossal
                cruciform stupa rising at the center of the monastic quadrangle. The terraced brick
                structure is decorated with terracotta plaques depicting Buddha, Bodhisattvas,
                mythological motifs, and contemporary daily life in 8th-century Bihar.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Surrounding the central stupa are 208 monastic cells, each with an attached veranda
                where Buddhist monks lived and meditated. An on-site Archaeological Survey of India (ASI)
                museum houses bronze sculptures, seals, terracotta tablets, and coins recovered during excavation.
              </p>
            </div>

            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Travel Details & Visiting Tips
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-brown-900">
                <div className="p-3.5 bg-white rounded-xl border border-brown-900/10 space-y-1">
                  <span className="font-bold text-brown-950 block">Distance from Hotel:</span>
                  <span className="text-brown-700">Approx. 44 km east (via NH 33 / Kahalgaon route)</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-brown-900/10 space-y-1">
                  <span className="font-bold text-brown-950 block">Travel Duration:</span>
                  <span className="text-brown-700">1.5 hours by private taxi or rental cab</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-brown-900/10 space-y-1">
                  <span className="font-bold text-brown-950 block">Opening Timings:</span>
                  <span className="text-brown-700">Sunrise to Sunset daily (ASI Museum closed on Fridays)</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-brown-900/10 space-y-1">
                  <span className="font-bold text-brown-950 block">Best Time to Visit:</span>
                  <span className="text-brown-700">October through March for pleasant weather</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brown-700 font-bold block mb-1">
                Base Your Trip With Us
              </span>
              <h3 className="font-serif text-xl font-bold text-brown-950 mb-2">
                Stay at Hotel Rajhans
              </h3>
              <p className="text-xs text-brown-700 mb-6 leading-relaxed">
                Centrally located at Kachari Chowk, MG Road, Bhagalpur. Return from your excursion
                to a comfortable AC room, hot showers, and fine dining at Takshshila Restaurant.
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
                  View Available Rooms
                </Link>
                <Link
                  href="/location"
                  className="w-full py-2 rounded-xl text-brown-800 hover:text-brown-950 text-xs font-semibold text-center block"
                >
                  Hotel Location & Directions →
                </Link>
              </div>

              <div className="pt-4 border-t border-brown-900/10 text-xs text-brown-800 space-y-1">
                <p className="font-semibold text-brown-950">Cab Transfers Available:</p>
                <p className="text-brown-600">
                  Our front desk can assist with private AC car hire for day excursions to Vikramshila ruins.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
