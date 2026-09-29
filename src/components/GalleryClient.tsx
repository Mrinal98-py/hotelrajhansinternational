"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

export interface GalleryPhoto {
  src: string;
  category: "all" | "executive" | "deluxe" | "royal" | "restaurant" | "hotel" | "facilities" | "parlour";
  categoryLabel: string;
  alt: string;
  title: string;
  aspect?: "wide" | "tall" | "square";
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  // AC Executive
  {
    src: "/images/executive/Room-001.jpg",
    category: "executive",
    categoryLabel: "AC Executive",
    alt: "AC Executive Room standard queen bed and bedhead at Hotel Rajhans",
    title: "AC Executive Room Comfort Bed",
    aspect: "wide",
  },
  {
    src: "/images/executive/Room-002.jpg",
    category: "executive",
    categoryLabel: "AC Executive",
    alt: "AC Executive Room executive study desk and work lamp",
    title: "Executive Work Desk & Study Area",
    aspect: "square",
  },
  {
    src: "/images/executive/Room-003.jpg",
    category: "executive",
    categoryLabel: "AC Executive",
    alt: "AC Executive Room spacious wardrobe and luggage rack",
    title: "In-Room Wardrobe & Storage",
    aspect: "tall",
  },
  {
    src: "/images/executive/Room-004.jpg",
    category: "executive",
    categoryLabel: "AC Executive",
    alt: "AC Executive Room attached en-suite bathroom with shower",
    title: "En-suite Bathroom & Toiletries",
    aspect: "square",
  },

  // AC Deluxe
  {
    src: "/images/deluxe/Delux001.jpg",
    category: "deluxe",
    categoryLabel: "AC Deluxe",
    alt: "AC Deluxe Room pocket-spring orthopedic mattress and bedding",
    title: "AC Deluxe Pocket-Spring Bed",
    aspect: "wide",
  },
  {
    src: "/images/deluxe/Delux002.jpg",
    category: "deluxe",
    categoryLabel: "AC Deluxe",
    alt: "AC Deluxe Room seating area with coffee table",
    title: "Deluxe Seating Area & Room Layout",
    aspect: "square",
  },
  {
    src: "/images/deluxe/Delux003.jpg",
    category: "deluxe",
    categoryLabel: "AC Deluxe",
    alt: "AC Deluxe Room ambient lighting and wall paneling",
    title: "Deluxe Bedroom Interior Design",
    aspect: "tall",
  },
  {
    src: "/images/deluxe/Delux004.jpg",
    category: "deluxe",
    categoryLabel: "AC Deluxe",
    alt: "AC Deluxe Room private attached washroom with fixtures",
    title: "Deluxe Private Bathroom",
    aspect: "square",
  },

  // Royal Suite
  {
    src: "/images/suite/SR001.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite master bedroom with plush king-sized bed",
    title: "Royal Suite Master Bedroom",
    aspect: "wide",
  },
  {
    src: "/images/suite/SR002.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite separate furnished living lounge with sofas",
    title: "Private Living Room Lounge",
    aspect: "wide",
  },
  {
    src: "/images/suite/SR003.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite study desk and in-room mini refrigerator",
    title: "Suite Workstation & Mini Refrigerator",
    aspect: "square",
  },
  {
    src: "/images/suite/SR004.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite first master en-suite washroom",
    title: "Suite Master Bathroom",
    aspect: "tall",
  },
  {
    src: "/images/suite/SR005.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite sofa seating corner and ambient interior",
    title: "Suite Sofa Seating Corner",
    aspect: "square",
  },
  {
    src: "/images/suite/SR006.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite dual-room layout connecting bedroom and lounge",
    title: "Connected Dual-Room Layout",
    aspect: "wide",
  },

  // Takshshila Restaurant
  {
    src: "/images/restaurant/R001.jpg",
    category: "restaurant",
    categoryLabel: "Takshshila Restaurant",
    alt: "Takshshila Restaurant fine dining hall with arranged table settings",
    title: "Takshshila Main Dining Hall",
    aspect: "wide",
  },
  {
    src: "/images/restaurant/R002.jpg",
    category: "restaurant",
    categoryLabel: "Takshshila Restaurant",
    alt: "Takshshila Restaurant family dining booths and lighting",
    title: "Family Dining Seating",
    aspect: "square",
  },
  {
    src: "/images/restaurant/R003.jpg",
    category: "restaurant",
    categoryLabel: "Takshshila Restaurant",
    alt: "Freshly prepared Indian specialty dish presentation",
    title: "Culinary Presentation",
    aspect: "tall",
  },
  {
    src: "/images/restaurant/R004.jpg",
    category: "restaurant",
    categoryLabel: "Takshshila Restaurant",
    alt: "Takshshila Restaurant buffet counter and serving area",
    title: "Buffet & Group Catering Area",
    aspect: "square",
  },

  // Reception & Hotel
  {
    src: "/images/reception/Reception001.jpg",
    category: "hotel",
    categoryLabel: "Hotel & Reception",
    alt: "Hotel Rajhans International front lobby and reception counter",
    title: "24/7 Front Desk Reception",
    aspect: "wide",
  },
  {
    src: "/images/reception/Reception002.jpg",
    category: "hotel",
    categoryLabel: "Hotel & Reception",
    alt: "Lobby waiting lounge with leather seating for arriving guests",
    title: "Guest Arrival Waiting Lounge",
    aspect: "square",
  },
  {
    src: "/images/reception/Reception003.jpg",
    category: "hotel",
    categoryLabel: "Hotel & Reception",
    alt: "Hotel Rajhans International reception hallway and elevator foyer",
    title: "Main Lobby & Foyer",
    aspect: "tall",
  },

  // Facilities & Parlour
  {
    src: "/images/parlour/BP001.jpg",
    category: "parlour",
    categoryLabel: "Beauty Parlour",
    alt: "On-site beauty parlour styling chairs and mirrors",
    title: "Beauty Parlour Styling Stations",
    aspect: "square",
  },
  {
    src: "/images/parlour/BP002.jpg",
    category: "parlour",
    categoryLabel: "Beauty Parlour",
    alt: "Beauty parlour treatment area and care products",
    title: "Parlour Grooming Area",
    aspect: "wide",
  },
  {
    src: "/images/ice-cream/ICP001.jpg",
    category: "facilities",
    categoryLabel: "Facilities",
    alt: "Hotel ice cream parlour counter and dessert freezer",
    title: "Ice Cream Parlour Facility",
    aspect: "square",
  },
];

const FILTER_TABS = [
  { id: "all", label: "All Photos" },
  { id: "executive", label: "AC Executive" },
  { id: "deluxe", label: "AC Deluxe" },
  { id: "royal", label: "Royal Suite" },
  { id: "restaurant", label: "Restaurant" },
  { id: "hotel", label: "Reception & Hotel" },
  { id: "facilities", label: "Facilities" },
  { id: "parlour", label: "Beauty Parlour" },
];

export default function GalleryClient() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const filteredPhotos =
    activeFilter === "all"
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === activeFilter);

  const handleOpenLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(
      (selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-brown-950 text-white shadow-xs"
                  : "bg-cream-soft border border-brown-900/10 text-brown-800 hover:bg-brown-900/5 hover:text-brown-950"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Masonry-Style Responsive Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPhotos.map((photo, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              key={photo.src}
              onClick={() => handleOpenLightbox(idx)}
              className="group relative bg-cream-soft rounded-2xl overflow-hidden border border-brown-900/10 shadow-xs hover:shadow-md cursor-pointer aspect-4/3"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Overlay & Metadata */}
              <div className="absolute inset-0 bg-gradient-to-t from-brown-950/85 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-bold">
                  {photo.categoryLabel}
                </span>
                <h3 className="font-serif text-sm font-bold text-white group-hover:text-gold-200 transition-colors">
                  {photo.title}
                </h3>
              </div>

              <div className="absolute top-3 right-3 p-2 rounded-xl bg-brown-950/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-950/90 backdrop-blur-md">
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
              aria-label="Close photo viewer"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={handlePrevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={handleNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="relative max-w-4xl max-h-[85vh] w-full h-[70vh] flex flex-col items-center justify-center">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={filteredPhotos[selectedPhotoIndex].src}
                  alt={filteredPhotos[selectedPhotoIndex].alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>

              <div className="mt-4 text-center text-white">
                <p className="font-serif text-lg font-bold">
                  {filteredPhotos[selectedPhotoIndex].title}
                </p>
                <p className="text-xs text-cream-soft/70">
                  {filteredPhotos[selectedPhotoIndex].categoryLabel} • {selectedPhotoIndex + 1} of{" "}
                  {filteredPhotos.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
