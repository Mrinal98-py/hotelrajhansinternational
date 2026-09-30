"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  src: string;
  category: "rooms" | "restaurant" | "services" | "reception" | "icecream" | "dormitory";
  alt: string;
  size: "square" | "tall" | "wide";
}

const galleryImages: GalleryImage[] = [
  {
    src: "/images/reception/Reception007.jpg",
    category: "reception",
    alt: "Hotel front desk reception staff",
    size: "wide",
  },
  {
    src: "/images/reception/Reception006.jpg",
    category: "reception",
    alt: "Guest arrival waiting lounge",
    size: "square",
  },
  {
    src: "/images/reception/Reception005.jpg",
    category: "reception",
    alt: "Main lobby hall",
    size: "tall",
  },
  {
    src: "/images/suite/SR001.jpg",
    category: "rooms",
    alt: "Royal suite master bedroom",
    size: "wide",
  },
  {
    src: "/images/suite/SR004.jpg",
    category: "rooms",
    alt: "Royal suite master bathroom",
    size: "tall",
  },
  {
    src: "/images/executive/Room-001.jpg",
    category: "rooms",
    alt: "Executive room with window view",
    size: "square",
  },
  {
    src: "/images/deluxe/Delux001.jpg",
    category: "rooms",
    alt: "Deluxe king room",
    size: "square",
  },
  {
    src: "/images/suite/SR005.jpg",
    category: "rooms",
    alt: "Royal suite living lounge",
    size: "wide",
  },
  {
    src: "/images/restaurant/R001.jpg",
    category: "restaurant",
    alt: "Takshshila restaurant main dining hall",
    size: "wide",
  },
  {
    src: "/images/restaurant/R002.jpg",
    category: "restaurant",
    alt: "Private family dining booth",
    size: "square",
  },
  {
    src: "/images/restaurant/R005.jpg",
    category: "restaurant",
    alt: "Restaurant celebration dining setup",
    size: "tall",
  },
  {
    src: "/images/parlour/BP010.jpg",
    category: "services",
    alt: "Beauty parlour styling stations",
    size: "tall",
  },
  {
    src: "/images/parlour/BP008.jpg",
    category: "services",
    alt: "Beauty parlour interior hallway",
    size: "square",
  },
  {
    src: "/images/ice-cream/ICP001.jpg",
    category: "icecream",
    alt: "Ice cream parlour service counter",
    size: "wide",
  },
  {
    src: "/images/ice-cream/ICP004.jpg",
    category: "icecream",
    alt: "Ice cream parlour seating area",
    size: "square",
  },
  {
    src: "/images/dormitory/DM005.jpg",
    category: "dormitory",
    alt: "Partitioned dormitory beds",
    size: "wide",
  },
  {
    src: "/images/dormitory/DM006.jpg",
    category: "dormitory",
    alt: "AC dormitory hall with lockers",
    size: "tall",
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "reception", label: "Lobby" },
  { id: "rooms", label: "Rooms" },
  { id: "restaurant", label: "Restaurant" },
  { id: "services", label: "Parlour & Saloon" },
  { id: "icecream", label: "Ice cream" },
  { id: "dormitory", label: "Dormitory" },
] as const;

export default function ImageGallery() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = galleryImages.filter(
    (img) => activeFilter === "all" || img.category === activeFilter
  );

  const openLightbox = (src: string) => {
    const index = filteredImages.findIndex((img) => img.src === src);
    if (index !== -1) setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = (direction: "prev" | "next") => {
    if (lightboxIndex === null) return;
    let newIndex = direction === "prev" ? lightboxIndex - 1 : lightboxIndex + 1;
    if (newIndex < 0) newIndex = filteredImages.length - 1;
    if (newIndex >= filteredImages.length) newIndex = 0;
    setLightboxIndex(newIndex);
  };

  return (
    <div className="space-y-12">
      {/* Elegant Categories Selector */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 border-b border-gold-400/10 pb-6 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`relative px-4 py-2 text-xs uppercase tracking-widest transition-all duration-300 rounded-full cursor-pointer ${
              activeFilter === cat.id
                ? "text-brown-900 font-medium"
                : "text-gold-200/60 hover:text-gold-300"
            }`}
          >
            {activeFilter === cat.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-gold-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((img) => (
            <motion.div
              key={img.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              onClick={() => openLightbox(img.src)}
              className={`group relative overflow-hidden rounded-lg cursor-pointer border border-gold-400/10 ${
                img.size === "tall"
                  ? "row-span-2"
                  : img.size === "wide"
                  ? "col-span-1 sm:col-span-2"
                  : "col-span-1"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream/95 backdrop-blur-md p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-gold-200/60 hover:text-gold-300 rounded-full hover:bg-brown-900/5 cursor-pointer z-50"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left Nav */}
            <button
              onClick={() => navigateLightbox("prev")}
              className="absolute left-4 p-3 text-gold-200/60 hover:text-gold-300 hover:bg-brown-900/5 rounded-full cursor-pointer z-40 transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            {/* Right Nav */}
            <button
              onClick={() => navigateLightbox("next")}
              className="absolute right-4 p-3 text-gold-200/60 hover:text-gold-300 hover:bg-brown-900/5 rounded-full cursor-pointer z-40 transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            {/* Main Lightbox Content */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full h-[80vh] flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                <Image
                  src={filteredImages[lightboxIndex].src}
                  alt={filteredImages[lightboxIndex].alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
