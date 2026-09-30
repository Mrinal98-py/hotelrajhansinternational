import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  Landmark,
  CalendarCheck,
  Car,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tourist Attractions in Bhagalpur | Hotel Rajhans International",
  description:
    "Explore top sightseeing destinations around Bhagalpur from Hotel Rajhans International: Vikramshila University ruins, Mandar Hill, Gangetic Dolphin Sanctuary, and Ajgaivinath Temple.",
  alternates: {
    canonical: getCanonicalUrl("/attractions"),
  },
  openGraph: {
    title: "Tourist Attractions in Bhagalpur | Hotel Rajhans International",
    description:
      "Historical and spiritual sightseeing excursions in and around Bhagalpur, Bihar. Base your exploration at Hotel Rajhans International.",
    url: getCanonicalUrl("/attractions"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/attractions/vikramshila.jpg`,
        width: 1200,
        height: 800,
        alt: "Vikramshila Ancient Buddhist University Ruins near Bhagalpur",
      },
    ],
  },
};

const ATTRACTIONS = [
  {
    slug: "vikramshila",
    name: "Vikramshila Ancient University Ruins",
    tagline: "8th-Century Global Center of Tantric Buddhism",
    distance: "44 km",
    travelTime: "~1.5 Hours Drive",
    image: "/images/attractions/vikramshila.jpg",
    alt: "Excavated Main Stupa and Monastic Complex of Vikramshila",
    dedicatedUrl: "/attractions/vikramshila",
    description:
      "Founded by Pala King Dharmapala in the late 8th century, Vikramshila was one of the two most illustrious universities of ancient India alongside Nalanda. Explore the monumental cruciform stupa, 208 monastic cells, and Buddhist archaeological artifacts.",
    highlights: ["Cruciform Buddhist Stupa", "Archaeological Museum", "Monastic Meditation Cells", "Ancient Pala Architecture"],
  },
  {
    slug: "mandar-hill",
    name: "Mandar Hill (Mandar Parvat)",
    tagline: "Sacred Granite Hill of Samudra Manthan",
    distance: "48 km",
    travelTime: "~1.5 Hours via Bounsi",
    image: "/images/attractions/mandar_hill.jpg",
    alt: "Mandar Hill Rock Face and Paparni Sarovar Lake",
    dedicatedUrl: "/attractions/mandar-hill",
    description:
      "A 700-foot singular granite monolithic hill revered by Hindu, Jain, and tribal traditions. Believed to have served as the churning rod during the churning of the cosmic ocean (Samudra Manthan). Features rock carvings, a scenic ropeway, and Paparni Lake.",
    highlights: ["Scenic Mountain Ropeway", "Paparni Holy Lake", "Jain Tirthankara Shrine", "Vishnu Rock Sculptures"],
  },
  {
    slug: "dolphin-sanctuary",
    name: "Vikramshila Gangetic Dolphin Sanctuary",
    tagline: "India's Premier River Dolphin Reserve",
    distance: "4 km",
    travelTime: "~15 Mins from Hotel",
    image: "/images/attractions/dolphin_sanctuary.jpg",
    alt: "Gangetic River Dolphin Sanctuary Along River Ganga Bhagalpur",
    description:
      "Stretching along a 65 km expanse of the River Ganga from Sultanganj to Kahalgaon, this sanctuary is India's only dedicated natural habitat for the endangered Gangetic Dolphin (Platanista gangetica), fondly known locally as 'Susu'.",
    highlights: ["Freshwater River Dolphins", "Ganga Boat Excursions", "Migratory Birds Watching", "Barari Ghat Access"],
  },
  {
    slug: "ajgaivinath-temple",
    name: "Ajgaivinath Temple (Sultanganj)",
    tagline: "Historic Island Shrine on River Ganga",
    distance: "26 km",
    travelTime: "~45 Mins by Road/Rail",
    image: "/images/attractions/ajgaivinath_temple.jpg",
    alt: "Ajgaivinath Rock-Cut Shiva Temple Sultanganj",
    description:
      "Perched atop a granite rock island emerging from the River Ganga in Sultanganj, this ancient Lord Shiva temple marks the starting point for millions of Kanwariya pilgrims who carry holy Ganga water on foot to Deoghar's Baidyanath Jyotirlinga.",
    highlights: ["Rock-Cut River Island Shrine", "Kanwar Yatra Origin Point", "Ancient Rock Inscriptions", "Panoramic River Views"],
  },
];

export default function AttractionsPage() {
  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[{ name: "Attractions", url: "/attractions" }]}
              currentUrl="/attractions"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Sightseeing & Excursions
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Tourist Attractions & Sightseeing Around Bhagalpur
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            From the monumental 8th-century ruins of Vikramshila University to sacred hills and
            river reserves, discover the rich heritage of Bhagalpur with Hotel Rajhans International
            as your central base.
          </p>
        </div>
      </section>

      {/* Attractions List */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="space-y-12">
          {ATTRACTIONS.map((spot, idx) => (
            <article
              key={spot.slug}
              className="bg-cream-soft border border-brown-900/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[260px]">
                <Image
                  src={spot.image}
                  alt={spot.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority={idx === 0}
                />
                <div className="absolute top-4 left-4 bg-brown-950/85 backdrop-blur-md text-gold-300 text-[11px] font-mono uppercase px-3 py-1 rounded-full border border-gold-400/30 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span>{spot.distance} from Hotel</span>
                </div>
              </div>

              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brown-600 font-bold block mb-1">
                    {spot.tagline}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                    {spot.dedicatedUrl ? (
                      <Link href={spot.dedicatedUrl} className="hover:text-brown-700 transition-colors">
                        {spot.name}
                      </Link>
                    ) : (
                      spot.name
                    )}
                  </h2>
                  <p className="text-sm text-brown-800/90 leading-relaxed mb-6">
                    {spot.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-brown-900 mb-6">
                    {spot.highlights.map((hl, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2">
                        <Landmark className="h-3.5 w-3.5 text-gold-700 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-brown-900/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-brown-600 font-medium">
                    <Clock className="h-4 w-4 text-brown-500" />
                    <span>Travel Time: {spot.travelTime}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {spot.dedicatedUrl && (
                      <Link
                        href={spot.dedicatedUrl}
                        className="px-4 py-2 text-xs font-bold text-brown-900 border border-brown-900/20 hover:bg-brown-900/5 rounded-xl transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>Read Full Guide</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    <Link
                      href="/booking"
                      className="px-5 py-2 text-xs font-bold bg-brown-900 hover:bg-brown-800 text-cream rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <CalendarCheck className="h-3.5 w-3.5 text-gold-400" />
                      <span>Book Stay</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Travel Assistance Banner */}
      <section className="bg-brown-950 text-cream py-12 px-6 border-t border-gold-400/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Need Cab Assistance for Sightseeing?
            </h3>
            <p className="text-xs sm:text-sm text-cream-soft/80">
              Our front desk helps guests arrange reliable AC taxi hires for day trips across Bhagalpur and Banka.
            </p>
          </div>
          <a
            href={`tel:${HOTEL_INFO.telephone}`}
            className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-brown-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2"
          >
            <span>Call Desk: {HOTEL_INFO.telephone}</span>
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
