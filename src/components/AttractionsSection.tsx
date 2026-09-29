"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Compass, Car, ExternalLink, Phone, Sparkles, Landmark, Trees, Milestone, ArrowRight } from "lucide-react";

export interface TouristAttraction {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  distanceText: string;
  travelTime: string;
  highlights: string;
  description: string;
  imageSrc: string;
  mapsUrl: string;
  guideUrl?: string;
  icon: any;
}

const ATTRACTIONS: TouristAttraction[] = [
  {
    id: "vikramshila-university",
    name: "Vikramshila Ancient University Ruins",
    category: "Ancient Heritage",
    categoryColor: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    distanceText: "44 km from Hotel",
    travelTime: "~55 mins drive",
    highlights: "8th Century Pala Empire Buddhist Monastery & Learning Center",
    description:
      "Founded by King Dharmapala, Vikramshila was one of the two premier Buddhist universities of ancient India alongside Nalanda. Explore the magnificent central stupa, monastery cells, and archaeological museum.",
    imageSrc: "/images/attractions/vikramshila.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Vikramshila+Ancient+University+Ruins+Kahalgaon+Bhagalpur",
    guideUrl: "/attractions/vikramshila",
    icon: Landmark,
  },
  {
    id: "dolphin-sanctuary",
    name: "Vikramshila Gangetic Dolphin Sanctuary",
    category: "Nature & Wildlife",
    categoryColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    distanceText: "15 km from Hotel",
    travelTime: "~20 mins drive",
    highlights: "India's Only Protected Gangetic River Dolphin Reserve",
    description:
      "Spanning 60 km along the Ganges River, this sanctuary protects the endangered freshwater Gangetic Dolphin (Platanista gangetica), river turtles, and migratory waterfowl. Boat tours available at ghats.",
    imageSrc: "/images/attractions/dolphin_sanctuary.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Vikramshila+Gangetic+Dolphin+Sanctuary+Bhagalpur",
    guideUrl: "/attractions",
    icon: Trees,
  },
  {
    id: "mandar-hill",
    name: "Historic Mandar Hill (Mandar Parvat)",
    category: "Mythology & Pilgrimage",
    categoryColor: "bg-purple-500/10 text-purple-300 border-purple-500/25",
    distanceText: "48 km from Hotel",
    travelTime: "~1 hr 10 mins drive",
    highlights: "Mythological Samudra Manthan Site & Jain Tirthankara Shrine",
    description:
      "Celebrated in Hindu epics as the churning rod used during Samudra Manthan (ocean churning). Features a scenic ropeway cable car, the sacred Papaharini Lake, ancient stone carvings, and 12th Jain Tirthankara shrine.",
    imageSrc: "/images/attractions/mandar_hill.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mandar+Hill+Banka+Bhagalpur",
    guideUrl: "/attractions/mandar-hill",
    icon: Milestone,
  },
  {
    id: "ajgaivinath-temple",
    name: "Sacred Ajgaivinath Temple, Sultanganj",
    category: "Sacred Pilgrimage",
    categoryColor: "bg-gold-400/10 text-gold-300 border-gold-400/25",
    distanceText: "28 km from Hotel",
    travelTime: "~40 mins drive",
    highlights: "Historic Island Shiva Temple on the Holy Ganges",
    description:
      "Perched atop a natural rock island in the flowing Ganges river at Sultanganj. Famous worldwide as the starting point for millions of pilgrims taking Uttarvahini Gangajal to Baidyanath Dham (Deoghar).",
    imageSrc: "/images/attractions/ajgaivinath_temple.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ajgaivinath+Temple+Sultanganj+Bhagalpur",
    guideUrl: "/attractions",
    icon: Landmark,
  },
];

export default function AttractionsSection() {
  return (
    <section id="attractions" className="py-20 bg-cream/30 relative border-t border-gold-400/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-gold-400 text-xs uppercase tracking-[0.3em] font-medium">
              <Compass className="h-4 w-4" />
              <span>Explore Bhagalpur</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
              Tourist Attractions & Excursions
            </h2>
            <p className="text-gold-200/70 text-xs md:text-sm leading-relaxed">
              Hotel Rajhans International is situated in central Bhagalpur on MG Road, offering seamless connectivity to the region&apos;s most prized historical, spiritual, and ecological landmarks.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-brown-900/40 border border-gold-400/20 px-4 py-3 rounded-xl text-xs">
            <Car className="h-5 w-5 text-gold-400 shrink-0" />
            <div>
              <span className="text-gold-100 font-semibold block">Travel Assistance</span>
              <span className="text-gold-200/60 text-[10px]">Private Cabs & Sightseeing Tours arranged at Reception</span>
            </div>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ATTRACTIONS.map((spot) => {
            const Icon = spot.icon || Compass;
            return (
              <div
                key={spot.id}
                className="group rounded-2xl bg-paper/80 border border-gold-400/20 overflow-hidden shadow-xl hover:border-gold-400/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image & Badge Container */}
                <div className="relative h-60 md:h-64 w-full overflow-hidden">
                  <Image
                    src={spot.imageSrc}
                    alt={spot.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.9] group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/20 to-transparent" />

                  {/* Top Category Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-mono px-3 py-1 rounded-full border backdrop-blur-md font-semibold ${spot.categoryColor}`}
                    >
                      {spot.category}
                    </span>
                  </div>

                  {/* Distance & Travel Time Badge */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-gold-100 font-mono">
                    <span className="flex items-center gap-1.5 bg-paper/90 backdrop-blur-md border border-gold-400/30 px-3 py-1 rounded-lg shadow">
                      <MapPin className="h-3.5 w-3.5 text-gold-400" /> {spot.distanceText}
                    </span>
                    <span className="flex items-center gap-1.5 bg-paper/90 backdrop-blur-md border border-gold-400/30 px-3 py-1 rounded-lg shadow text-gold-300">
                      <Car className="h-3.5 w-3.5 text-gold-400" /> {spot.travelTime}
                    </span>
                  </div>
                </div>

                {/* Content Card Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl md:text-2xl text-gold-100 font-medium group-hover:text-gold-300 transition-colors">
                      {spot.name}
                    </h3>
                    <p className="text-xs text-gold-300/90 font-medium tracking-wide flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-gold-400 shrink-0" />
                      {spot.highlights}
                    </p>
                    <p className="text-xs text-gold-200/70 leading-relaxed font-normal pt-1">
                      {spot.description}
                    </p>
                  </div>

                  {/* Card Action Links */}
                  <div className="pt-4 border-t border-gold-400/10 flex items-center justify-between gap-3">
                    {spot.guideUrl && (
                      <Link
                        href={spot.guideUrl}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gold-300 hover:text-white transition-colors uppercase tracking-wider font-sans group/link"
                      >
                        <span>Explore Guide</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform text-gold-400" />
                      </Link>
                    )}
                    <a
                      href={spot.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold-400 hover:text-gold-200 transition-colors uppercase tracking-wider font-sans group/link ml-auto"
                    >
                      <span>Directions</span>
                      <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Concierge & Taxi Call Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-brown-900/60 to-brown-900/30 border border-gold-400/25 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-lg text-gold-100 font-medium">Need Travel Guidance or Sightseeing Taxi?</h4>
            <p className="text-xs text-gold-200/70">Our 24-hour reception desk can arrange comfortable air-conditioned cabs & local guides for your trip.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+919308189201"
              className="bg-gold-400 hover:bg-gold-500 text-brown-900 font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-md"
            >
              <Phone className="h-3.5 w-3.5" /> Call Front Desk
            </a>
            <a
              href="https://wa.me/919308189201?text=Hello%2C%20I%20am%20staying%20at%20Hotel%20Rajhans%20International%20and%20would%20like%20to%20inquire%20about%20a%20tourist%20cab%2Fsightseeing."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-md"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
