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
  category: "all" | "executive" | "deluxe" | "royal" | "dormitory" | "restaurant" | "hotel" | "facilities" | "parlour";
  categoryLabel: string;
  alt: string;
  title: string;
  aspect?: "wide" | "tall" | "square";
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  // AC Executive (3 unique photos)
  {
    src: "/images/executive/Room-001.jpg",
    category: "executive",
    categoryLabel: "AC Executive",
    alt: "AC Executive room window view with seating chairs, table and work desk",
    title: "Executive Room Seating & Window View",
    aspect: "wide",
  },
  {
    src: "/images/executive/Room-005.jpg",
    category: "executive",
    categoryLabel: "AC Executive",
    alt: "AC Executive twin beds with padded headboards and decorative wallpaper",
    title: "AC Executive Twin Beds",
    aspect: "wide",
  },
  {
    src: "/images/executive/Room-006.jpg",
    category: "executive",
    categoryLabel: "AC Executive",
    alt: "AC Executive room layout showing split air conditioner and dressing mirror",
    title: "Executive Twin Bed Layout & Split AC",
    aspect: "wide",
  },

  // AC Deluxe (2 unique photos)
  {
    src: "/images/deluxe/Delux001.jpg",
    category: "deluxe",
    categoryLabel: "AC Deluxe",
    alt: "AC Deluxe room plush king bed with tufted headboard and natural window light",
    title: "AC Deluxe King Bed",
    aspect: "wide",
  },
  {
    src: "/images/deluxe/Delux003.jpg",
    category: "deluxe",
    categoryLabel: "AC Deluxe",
    alt: "AC Deluxe room interior view with split AC, side table and wooden flooring",
    title: "Deluxe Room Interior & Split AC",
    aspect: "wide",
  },

  // Royal Suite (6 distinct rooms and perspectives)
  {
    src: "/images/suite/SR001.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite master bedroom king-sized bed with towel art and wooden door",
    title: "Royal Suite Master Bedroom",
    aspect: "wide",
  },
  {
    src: "/images/suite/SR005.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite private living lounge with comfortable armchairs and wall artwork",
    title: "Private Living Lounge",
    aspect: "wide",
  },
  {
    src: "/images/suite/SR008.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite dedicated study desk, workstation chair and luggage rack",
    title: "Suite Workstation & Study Desk",
    aspect: "wide",
  },
  {
    src: "/images/suite/SR009.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite handcrafted wooden wardrobe closet and full-length dressing mirror",
    title: "Wooden Wardrobe & Dressing Area",
    aspect: "wide",
  },
  {
    src: "/images/suite/SR004.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite en-suite bathroom with granite vanity counter, mirror and geyser",
    title: "Master Bathroom with Geyser",
    aspect: "tall",
  },
  {
    src: "/images/suite/SR011.jpg",
    category: "royal",
    categoryLabel: "Royal Suite",
    alt: "Royal Suite master bed side angle featuring large picture window",
    title: "Master Bed & Window View",
    aspect: "wide",
  },

  // AC Dormitory (3 unique photos)
  {
    src: "/images/dormitory/DM005.jpg",
    category: "dormitory",
    categoryLabel: "AC Dormitory",
    alt: "AC Dormitory individual partitioned beds with linen, pillows and charging points",
    title: "Individual Partitioned Dormitory Beds",
    aspect: "wide",
  },
  {
    src: "/images/dormitory/DM006.jpg",
    category: "dormitory",
    categoryLabel: "AC Dormitory",
    alt: "Spacious AC Dormitory hall with numbered cubicles and under-bed storage",
    title: "AC Dormitory Hall with Lockers",
    aspect: "wide",
  },
  {
    src: "/images/dormitory/DM0010.jpg",
    category: "dormitory",
    categoryLabel: "AC Dormitory",
    alt: "Rajhans Tower dormitory entrance with 24/7 heavy-duty power backup generator",
    title: "Rajhans Tower & Power Facility",
    aspect: "wide",
  },

  // Takshshila Restaurant (4 distinct dining perspectives)
  {
    src: "/images/restaurant/R001.jpg",
    category: "restaurant",
    categoryLabel: "Takshshila Restaurant",
    alt: "Takshshila Restaurant main dining hall with leather seating and ambient lighting",
    title: "Takshshila Main Dining Hall",
    aspect: "wide",
  },
  {
    src: "/images/restaurant/R002.jpg",
    category: "restaurant",
    categoryLabel: "Takshshila Restaurant",
    alt: "Takshshila Restaurant private dining booth with foliage accent wall",
    title: "Private Family Dining Booth",
    aspect: "wide",
  },
  {
    src: "/images/restaurant/R005.jpg",
    category: "restaurant",
    categoryLabel: "Takshshila Restaurant",
    alt: "Takshshila Restaurant celebration table setup with balloon decor",
    title: "Celebration & Party Dining Setup",
    aspect: "wide",
  },
  {
    src: "/images/restaurant/R006.jpg",
    category: "restaurant",
    categoryLabel: "Takshshila Restaurant",
    alt: "Reserved long banquet dining table with formal dinner settings",
    title: "Reserved Banquet Dining Table",
    aspect: "wide",
  },

  // Reception & Lobby (3 distinct perspectives)
  {
    src: "/images/reception/Reception007.jpg",
    category: "hotel",
    categoryLabel: "Reception & Lobby",
    alt: "Hotel Rajhans International 24/7 front desk with uniformed reception staff",
    title: "24/7 Front Desk Reception Staff",
    aspect: "wide",
  },
  {
    src: "/images/reception/Reception006.jpg",
    category: "hotel",
    categoryLabel: "Reception & Lobby",
    alt: "Guest arrival waiting lounge with sofa seating, garden window and newspaper stand",
    title: "Guest Arrival Waiting Lounge",
    aspect: "wide",
  },
  {
    src: "/images/reception/Reception005.jpg",
    category: "hotel",
    categoryLabel: "Reception & Lobby",
    alt: "Spacious main hotel lobby hall with visitor seating and reception counter",
    title: "Main Lobby & Visitor Hall",
    aspect: "wide",
  },

  // Facilities & Sweets (2 unique photos)
  {
    src: "/images/ice-cream/ICP001.jpg",
    category: "facilities",
    categoryLabel: "Facilities",
    alt: "Ice and Spice parlour service counter with Amul ice cream freezer and drinks",
    title: "Ice Cream & Beverage Counter",
    aspect: "wide",
  },
  {
    src: "/images/ice-cream/ICP004.jpg",
    category: "facilities",
    categoryLabel: "Facilities",
    alt: "Ice Cream Parlour indoor dining area with wooden tables and decorative lighting",
    title: "Parlour Seating & Dining Area",
    aspect: "wide",
  },

  // Beauty Parlour (3 unique photos)
  {
    src: "/images/parlour/BP002.jpg",
    category: "parlour",
    categoryLabel: "Beauty Parlour",
    alt: "Rajhans Ladies Beauty Parlour reception desk with attendant and service menu",
    title: "Beauty Parlour Reception Desk",
    aspect: "tall",
  },
  {
    src: "/images/parlour/BP011.jpg",
    category: "parlour",
    categoryLabel: "Beauty Parlour",
    alt: "Fully equipped salon floor with styling chairs, hair spa equipment and mirrors",
    title: "Salon Styling Stations & Hair Spa",
    aspect: "wide",
  },
  {
    src: "/images/parlour/BP009.jpg",
    category: "parlour",
    categoryLabel: "Beauty Parlour",
    alt: "Beauty parlour client waiting lounge with comfortable leather sofa",
    title: "Parlour Client Waiting Lounge",
    aspect: "tall",
  },
];

const FILTER_TABS = [
  { id: "all", label: "All Photos" },
  { id: "executive", label: "AC Executive" },
  { id: "deluxe", label: "AC Deluxe" },
  { id: "royal", label: "Royal Suite" },
  { id: "dormitory", label: "AC Dormitory" },
  { id: "restaurant", label: "Takshshila Restaurant" },
  { id: "hotel", label: "Reception & Lobby" },
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
