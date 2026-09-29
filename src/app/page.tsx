"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Compass,
  ChevronDown,
  Award,
  ShieldCheck,
  Check,
  Star,
  Quote,
  Clock,
  Sparkles,
  Scissors,
  Coffee,
  Utensils,
  MapPinHouse,
  Menu,
  X,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import BookingModal from "@/components/BookingModal";
import ImageGallery from "@/components/ImageGallery";
import LocationSection from "@/components/LocationSection";
import AttractionsSection from "@/components/AttractionsSection";

// Hero Slideshow images (reception, suite, restaurant)
const heroSlides = [
  {
    src: "/images/reception/Reception001.jpg",
    title: "Hotel Rajhans International",
    subtitle: "On MG Road, Kachari Chowk — rooms, dining, and parking on-site.",
  },
  {
    src: "/images/suite/SR001.jpg",
    title: "Rooms & Suites",
    subtitle: "Executive, Deluxe, and Royal Suite options for business and family stays.",
  },
  {
    src: "/images/restaurant/R001.jpg",
    title: "Takshshila Restaurant",
    subtitle: "Indian, Chinese, and continental food without leaving the hotel.",
  },
];

const defaultReviews = [
  {
    id: "rev-1",
    authorName: "Mrinal Raj",
    authorInitials: "MR",
    rating: 5,
    reviewText: "Very well maintained. Support staff was extremely friendly. Even though it is located in the middle of the city, the hotel is peaceful and exceptionally maintained. The food is excellent, and cleanliness and guest service are outstanding.",
    source: "Google review",
  },
  {
    id: "rev-2",
    authorName: "Rituraj Rathore",
    authorInitials: "RR",
    rating: 5,
    reviewText: "I stayed for two days. The ambience was wonderful, the staff were courteous, the rooms were clean, and the food was delicious. The tea served in an earthen pot was especially memorable.",
    source: "Google review",
  },
];

const defaultFaqs = [
  {
    question: "Food & dining",
    answer: "Takshshila Restaurant serves Indian, Chinese, and continental dishes. Room service runs 24 hours. Ice & Spice is the in-house ice cream parlour.",
  },
  {
    question: "Parking",
    answer: "Free parking on-site, monitored around the clock.",
  },
  {
    question: "Railway station pickup",
    answer: "Pickup and drop can be arranged on request. Bhagalpur Railway Station is about 1.5 km away.",
  },
  {
    question: "Location",
    answer: "Kachari Chowk, MG Road — near markets, district courts, banks, and government offices.",
  },
  {
    question: "Pets",
    answer: "Pets are not allowed. Call ahead if you are travelling with a service animal.",
  },
  {
    question: "WiFi & business needs",
    answer: "WiFi in all rooms. Printing and scanning available at the front desk.",
  },
];

const todayIso = new Date().toISOString().split("T")[0];
const tomorrowIso = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoomCategory, setSelectedRoomCategory] = useState("executive");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic DB Data state with fallbacks matching database baseline
  const [roomRates, setRoomRates] = useState<Record<string, { single: number; double: number }>>({
    executive: { single: 3790, double: 4490 },
    deluxe: { single: 3790, double: 4490 },
    royal: { single: 5190, double: 5190 },
  });

  const [roomStatuses, setRoomStatuses] = useState<Record<string, string>>({
    executive: "AVAILABLE",
    deluxe: "AVAILABLE",
    royal: "AVAILABLE",
  });

  const [roomsData, setRoomsData] = useState<Record<string, {
    name: string;
    single: number;
    double: number;
    status: string;
    description: string;
    amenities: string[];
  }>>({
    executive: {
      name: "Executive Room",
      single: 3790,
      double: 4490,
      status: "DEACTIVATED",
      description: "Good for solo travellers and short business trips.",
      amenities: ["Standard Bed", "Study Table", "Fruit Basket", "TV", "Large Wardrobe", "A/C"],
    },
    deluxe: {
      name: "Deluxe Room",
      single: 3790,
      double: 4490,
      status: "DEACTIVATED",
      description: "More space and a pocket-spring bed.",
      amenities: ["Pocket Spring Bed", "Study Table", "Fruit Basket", "TV", "Large Wardrobe", "A/C"],
    },
    royal: {
      name: "Royal Suite",
      single: 5190,
      double: 5190,
      status: "DEACTIVATED",
      description: "Separate bedroom and living room with two washrooms.",
      amenities: [
        "Bedroom + Living Room",
        "Double Washroom",
        "Mini Fridge",
        "Study Table",
        "Sofa Seating Area",
        "Fruit Basket",
        "A/C",
      ],
    },
  });

  const [cmsSettings, setCmsSettings] = useState<Record<string, string>>({});
  const [reviewsList, setReviewsList] = useState<any[]>(defaultReviews);
  const [faqsList, setFaqsList] = useState<any[]>(defaultFaqs);

  // Quick contact form states
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Dynamic Data fetch from DB APIs with no-store cache control & focus auto-sync
  useEffect(() => {
    const loadDynamicData = () => {
      fetch("/api/rooms", { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
        .then((res) => res.json())
        .then((d) => {
          if (d.success && d.rooms) {
            const rates: Record<string, { single: number; double: number }> = {};
            const statuses: Record<string, string> = {};
            const detailsMap: Record<string, any> = {};

            d.rooms.forEach((r: any) => {
              const key = r.type.toLowerCase().replace("royal_suite", "royal");
              rates[key] = { single: r.basePriceSingle, double: r.basePriceDouble };
              statuses[key] = r.status;
              detailsMap[key] = {
                name: r.name,
                single: r.basePriceSingle,
                double: r.basePriceDouble,
                status: r.status,
                description: r.description,
                amenities: Array.isArray(r.amenities) && r.amenities.length > 0
                  ? r.amenities.map((a: any) => (typeof a === "string" ? a : a.amenityName))
                  : [],
              };
            });

            setRoomRates((prev) => ({ ...prev, ...rates }));
            setRoomStatuses((prev) => ({ ...prev, ...statuses }));
            setRoomsData((prev) => {
              const next = { ...prev };
              Object.keys(detailsMap).forEach((k) => {
                if (next[k]) {
                  next[k] = {
                    ...next[k],
                    ...detailsMap[k],
                    amenities: detailsMap[k].amenities.length > 0 ? detailsMap[k].amenities : next[k].amenities,
                  };
                } else {
                  next[k] = detailsMap[k];
                }
              });
              return next;
            });
          }
        })
        .catch(console.error);

      fetch("/api/cms", { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
        .then((res) => res.json())
        .then((d) => {
          if (d.success) {
            if (d.settings) setCmsSettings(d.settings);
            if (d.faqs && Array.isArray(d.faqs) && d.faqs.length > 0) setFaqsList(d.faqs);
            if (d.reviews && Array.isArray(d.reviews) && d.reviews.length > 0) setReviewsList(d.reviews);
          }
        })
        .catch(console.error);
    };

    loadDynamicData();

    // Re-fetch fresh data when user returns/focuses tab
    window.addEventListener("focus", loadDynamicData);
    return () => window.removeEventListener("focus", loadDynamicData);
  }, []);

  // Preload hero slideshow & room images in browser cache immediately on page load
  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.src;
    });
    const keyImages = [
      "/images/executive/Room-001.jpg",
      "/images/deluxe/Delux001.jpg",
      "/images/suite/SR001.jpg",
      "/images/parlour/BP001.jpg",
      "/images/restaurant/R001.jpg",
      "/images/ice-cream/ICP001.jpg",
    ];
    keyImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Hero Carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Navbar scroll background change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsNavbarScrolled(true);
      } else {
        setIsNavbarScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openBooking = (category: string) => {
    setSelectedRoomCategory(category);
    setIsBookingOpen(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      setContactSuccess(true);
      setTimeout(() => {
        setContactForm({ name: "", email: "", message: "" });
        setContactSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Contact error:", err);
    }
  };



  return (
    <>
      {/* 1. Transparent Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 py-4 ${
          isNavbarScrolled ? "glass-nav shadow-lg" : "bg-gradient-to-b from-cream-soft/95 to-cream-soft/20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <a href="#hero" className="flex flex-col">
            <span className="font-serif text-lg md:text-xl text-gold-300 tracking-[0.2em] font-medium uppercase leading-tight">
              {cmsSettings.hotel_name ? cmsSettings.hotel_name.split(" ")[1] || "Rajhans" : "Rajhans"}
            </span>
            <span className="text-[8px] md:text-[9px] text-gold-200/60 tracking-[0.25em] uppercase font-sans">
              International
            </span>
          </a>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#about" className="text-xs uppercase tracking-widest text-gold-100 hover:text-gold-300 transition-colors font-medium">About</a>
            <a href="#rooms" className="text-xs uppercase tracking-widest text-gold-100 hover:text-gold-300 transition-colors font-medium">Suites</a>
            <a href="#services" className="text-xs uppercase tracking-widest text-gold-100 hover:text-gold-300 transition-colors font-medium">Services</a>
            <Link href="/gallery" className="text-xs uppercase tracking-widest text-gold-100 hover:text-gold-300 transition-colors font-medium">Gallery</Link>
            <Link href="/attraction" className="text-xs uppercase tracking-widest text-gold-100 hover:text-gold-300 transition-colors font-medium">Attractions</Link>
            <a href="#testimonials" className="text-xs uppercase tracking-widest text-gold-100 hover:text-gold-300 transition-colors font-medium">Reviews</a>
            <a href="#faq" className="text-xs uppercase tracking-widest text-gold-100 hover:text-gold-300 transition-colors font-medium">FAQ</a>
            <a href="#contact" className="text-xs uppercase tracking-widest text-gold-100 hover:text-gold-300 transition-colors font-medium">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${cmsSettings.phone_primary || "+919308189201"}`}
              className="text-gold-200/80 hover:text-gold-300 p-2 border border-gold-400/10 rounded-full hover:bg-brown-900/5 transition-all text-xs flex items-center gap-2"
              aria-label="Call hotel"
            >
              <Phone className="h-4 w-4 text-gold-400" />
              <span className="hidden sm:inline font-mono text-[10px] tracking-wider">{cmsSettings.phone_primary || "+91 93081 89201"}</span>
            </a>
            <button
              onClick={() => openBooking("executive")}
              className="hidden sm:block bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-brown-900 font-medium uppercase tracking-widest text-[10px] py-2.5 px-5 rounded-full transition-all duration-300 shadow-md shadow-gold-400/10 active:scale-95 cursor-pointer"
            >
              Book Stay
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gold-200 hover:text-gold-300 transition-colors rounded-full hover:bg-brown-900/5 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-cream/95 backdrop-blur-lg pt-24 px-6 pb-8 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-6 text-center pt-8">
              {[
                { label: "About", href: "#about" },
                { label: "Rooms", href: "#rooms" },
                { label: "Services", href: "#services" },
                { label: "Gallery", href: "/gallery" },
                { label: "Attractions", href: "/attraction" },
                { label: "Reviews", href: "#testimonials" },
                { label: "FAQ", href: "#faq" },
                { label: "Contact", href: "#contact" }
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-serif text-xl tracking-widest text-gold-100 hover:text-gold-300 transition-colors uppercase py-2"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-gold-400/10 pt-8">
              <a
                href={`tel:${cmsSettings.phone_primary || "+919308189201"}`}
                className="flex items-center gap-2 text-gold-300 hover:text-gold-200 text-sm font-mono tracking-wider"
              >
                <Phone className="h-4 w-4" /> {cmsSettings.phone_primary || "+91 93081 89201"}
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openBooking("executive");
                }}
                className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-brown-900 font-medium uppercase tracking-widest text-xs py-3.5 rounded-full text-center cursor-pointer"
              >
                Book a Room
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Fullscreen Hero Section */}
      <section id="hero" className="relative h-screen w-full overflow-visible bg-cream flex flex-col justify-center">
        {/* Slideshow */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroSlides[currentSlide].src}
                alt={heroSlides[currentSlide].title}
                fill
                priority
                loading="eager"
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cream/95 via-cream/68 to-cream/86" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="space-y-4 max-w-3xl"
          >
            <span className="text-gold-400 text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
              Bhagalpur · Est. 1986
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-gold-50 tracking-wide font-medium leading-tight drop-shadow-[0_1px_0_rgba(255,246,230,0.75)]">
              {cmsSettings.hotel_name || heroSlides[currentSlide].title}
            </h1>
            <p className="text-gold-100/85 text-sm md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              {cmsSettings.hotel_subtitle || heroSlides[currentSlide].subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <button
              onClick={() => openBooking("executive")}
              className="bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-brown-900 font-medium uppercase tracking-widest text-xs py-3.5 px-8 rounded-full transition-all duration-300 shadow-xl shadow-gold-400/25 cursor-pointer"
            >
              Book a Room
            </button>
            <a
              href="#about"
              className="hidden sm:inline-flex border border-gold-200/30 hover:border-gold-300 text-gold-200 hover:text-gold-50 hover:bg-brown-900/5 font-medium uppercase tracking-widest text-xs py-3.5 px-8 rounded-full transition-all duration-300 cursor-pointer"
            >
              About the Hotel
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-gold-200/40 hover:text-gold-200/80 transition-colors">
          <span className="text-[9px] uppercase tracking-[0.3em] font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            <ChevronDown className="h-4 w-4 text-gold-400" />
          </motion.div>
        </div>

        {/* 3. Luxury Booking Widget */}
        <div className="relative md:absolute bottom-0 left-0 right-0 z-20 w-full md:transform md:translate-y-1/2 px-4 md:px-6 mt-12 md:mt-0">
          <div className="max-w-6xl mx-auto glass-panel rounded-lg shadow-2xl p-5 border border-gold-400/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-gold-200/80 mb-2">Check-In</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 text-xs focus:outline-none focus:border-gold-400/40"
                  defaultValue={todayIso}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-gold-200/80 mb-2">Check-Out</label>
              <input
                type="date"
                className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 text-xs focus:outline-none focus:border-gold-400/40"
                defaultValue={tomorrowIso}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-gold-200/80 mb-2">Guests</label>
              <select defaultValue="2" className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 text-xs focus:outline-none focus:border-gold-400/40">
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </div>
            <button
              onClick={() => openBooking("executive")}
              className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-brown-900 font-medium uppercase tracking-widest text-xs py-3 px-4 rounded-lg transition-all duration-300 shadow-md shadow-gold-400/10 cursor-pointer h-[42px] flex items-center justify-center"
            >
              Check Availability
            </button>
          </div>
        </div>
      </section>

      {/* Spacer for Booking Widget overflow */}
      <div className="h-24 bg-cream" />

      {/* 4. About Hotel Section */}
      <section id="about" className="py-24 bg-cream relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-6">
            <div className="space-y-2">
              <span className="text-gold-400 text-xs uppercase tracking-[0.3em] font-medium block">
                Since 1986
              </span>
              <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
                About the Hotel
              </h2>
            </div>

            <p className="text-gold-200/85 text-sm md:text-base font-normal leading-relaxed">
              {cmsSettings.hotel_name || "Hotel Rajhans International"} has been run by {cmsSettings.company_name || "Takshshila Regency Pvt. Ltd."} since 1986. We host business travellers, families, and groups passing through Bhagalpur.
            </p>

            <p className="text-gold-200/80 text-sm leading-relaxed">
              The property sits at {cmsSettings.address_full || "Kachari Chowk, MG Road, Bhagalpur"} — walking distance to courts, markets, and the railway station.
            </p>

            <div className="pt-6 border-t border-gold-400/10 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-400/5 rounded-full border border-gold-400/20">
                  <Award className="h-6 w-6 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-gold-100 font-semibold font-sans">
                    ISO 9001:2015
                  </h4>
                  <p className="text-[10px] text-gold-200/50">Certified since 1986</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-400/5 rounded-full border border-gold-400/20">
                  <ShieldCheck className="h-6 w-6 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-gold-100 font-semibold font-sans">
                    24/7 Security
                  </h4>
                  <p className="text-[10px] text-gold-200/50">CCTV & on-site staff</p>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* 5. Why Choose Us Section */}
      <section className="py-24 bg-cream-soft/60 relative overflow-hidden border-t border-b border-gold-400/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-gold-400 text-xs uppercase tracking-[0.3em] font-medium">Why stay here</span>
            <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
              What guests count on
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: "Central location", description: "Kachari Chowk, MG Road.", icon: MapPin },
              { title: "Clean rooms", description: "Work desk, A/C, and daily housekeeping.", icon: Award },
              { title: "On-site dining", description: "Restaurant, parlour, saloon, and ice cream.", icon: Utensils },
              { title: "Free parking", description: "Private parking with round-the-clock monitoring.", icon: ShieldCheck },
              { title: "Station pickup", description: "Drop and pickup arranged on request.", icon: Compass },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass-card rounded-lg p-6 text-center hover:border-gold-400/30 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center space-y-4"
              >
                <div className="p-3 bg-gold-400/5 rounded-full border border-gold-400/20 text-gold-400">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-base text-gold-100 font-medium tracking-wide">
                  {item.title}
                </h3>
                <p className="text-gold-200/50 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Luxury Room Collection Section */}
      <section id="rooms" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2">
              <span className="text-gold-400 text-xs uppercase tracking-[0.3em] font-medium block">
                Accommodations
              </span>
              <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
                Rooms & Suites
              </h2>
            </div>
            <p className="text-gold-200/60 text-sm max-w-md font-normal leading-relaxed">
              Three room types. Prices below are per night before taxes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Executive Room */}
            <div className="glass-card rounded-lg overflow-hidden flex flex-col border border-gold-400/10 group">
              <div className="relative h-[280px] w-full overflow-hidden">
                <Image
                  src="/images/executive/Room-001.jpg"
                  alt={roomsData.executive.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  loading="lazy"
                />
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl md:text-2xl text-gold-50 font-medium tracking-wide">
                        {roomsData.executive.name}
                      </h3>
                      {roomsData.executive.status && (
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-semibold border ${
                            roomsData.executive.status === "AVAILABLE"
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                              : roomsData.executive.status === "OCCUPIED"
                              ? "bg-red-950/60 text-red-300 border-red-500/30"
                              : "bg-amber-950/60 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {roomsData.executive.status}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gold-300 font-sans text-lg font-semibold">
                        ₹{roomsData.executive.single.toLocaleString()} <span className="text-[10px] text-gold-200/50 font-sans font-normal">/ Single</span>
                      </p>
                      <p className="text-gold-200/60 font-sans text-xs">
                        ₹{roomsData.executive.double.toLocaleString()} <span className="text-[9px] text-gold-200/40 font-sans font-normal">/ Double</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-gold-200/60 text-xs leading-relaxed">
                    {roomsData.executive.description}
                  </p>

                  <div className="pt-2">
                    <p className="text-[10px] text-gold-200/40 uppercase tracking-widest mb-2 font-semibold">Includes</p>
                    <div className="flex flex-wrap gap-2">
                      {roomsData.executive.amenities.map((tag) => (
                        <span key={tag} className="text-[9px] bg-brown-900/5 border border-gold-400/5 text-gold-200/70 py-1 px-2.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => openBooking("executive")}
                    className="flex-grow bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-brown-900 font-medium uppercase tracking-widest text-[10px] py-3 px-4 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    Book Room
                  </button>
                </div>
              </div>
            </div>

            {/* Deluxe Room */}
            <div className="glass-card rounded-lg overflow-hidden flex flex-col border border-gold-400/10 group">
              <div className="relative h-[280px] w-full overflow-hidden">
                <Image
                  src="/images/deluxe/Delux001.jpg"
                  alt={roomsData.deluxe.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  loading="lazy"
                />
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl md:text-2xl text-gold-50 font-medium tracking-wide">
                        {roomsData.deluxe.name}
                      </h3>
                      {roomsData.deluxe.status && (
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-semibold border ${
                            roomsData.deluxe.status === "AVAILABLE"
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                              : roomsData.deluxe.status === "OCCUPIED"
                              ? "bg-red-950/60 text-red-300 border-red-500/30"
                              : "bg-amber-950/60 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {roomsData.deluxe.status}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gold-300 font-sans text-lg font-semibold">
                        ₹{roomsData.deluxe.single.toLocaleString()} <span className="text-[10px] text-gold-200/50 font-sans font-normal">/ Single</span>
                      </p>
                      <p className="text-gold-200/60 font-sans text-xs">
                        ₹{roomsData.deluxe.double.toLocaleString()} <span className="text-[9px] text-gold-200/40 font-sans font-normal">/ Double</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-gold-200/60 text-xs leading-relaxed">
                    {roomsData.deluxe.description}
                  </p>

                  <div className="pt-2">
                    <p className="text-[10px] text-gold-200/40 uppercase tracking-widest mb-2 font-semibold">Includes</p>
                    <div className="flex flex-wrap gap-2">
                      {roomsData.deluxe.amenities.map((tag) => (
                        <span key={tag} className="text-[9px] bg-brown-900/5 border border-gold-400/5 text-gold-200/70 py-1 px-2.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => openBooking("deluxe")}
                    className="flex-grow bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-brown-900 font-medium uppercase tracking-widest text-[10px] py-3 px-4 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    Book Room
                  </button>
                </div>
              </div>
            </div>

            {/* Royal Suite */}
            <div className="glass-card rounded-lg overflow-hidden flex flex-col border border-gold-400/15 group shadow-xl">
              <div className="relative h-[280px] w-full overflow-hidden">
                <Image
                  src="/images/suite/SR001.jpg"
                  alt={roomsData.royal.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  loading="lazy"
                />
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl md:text-2xl text-gold-50 font-medium tracking-wide">
                        {roomsData.royal.name}
                      </h3>
                      {roomsData.royal.status && (
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-semibold border ${
                            roomsData.royal.status === "AVAILABLE"
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                              : roomsData.royal.status === "OCCUPIED"
                              ? "bg-red-950/60 text-red-300 border-red-500/30"
                              : "bg-amber-950/60 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {roomsData.royal.status}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gold-300 font-sans text-xl font-semibold">
                        ₹{roomsData.royal.single.toLocaleString()} <span className="text-[10px] text-gold-200/50 font-sans font-normal">/ Suite</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-gold-200/60 text-xs leading-relaxed">
                    {roomsData.royal.description}
                  </p>

                  <div className="pt-2">
                    <p className="text-[10px] text-gold-200/40 uppercase tracking-widest mb-2 font-semibold">Includes</p>
                    <div className="flex flex-wrap gap-2">
                      {roomsData.royal.amenities.map((tag) => (
                        <span key={tag} className="text-[9px] bg-brown-900/5 border border-gold-400/5 text-gold-200/70 py-1 px-2.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => openBooking("royal")}
                    className="flex-grow bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-brown-900 font-medium uppercase tracking-widest text-[10px] py-3 px-4 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    Book Suite
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Hotel Amenities Section */}
      <section className="py-24 bg-cream-soft/40 border-t border-b border-gold-400/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-gold-400 text-xs uppercase tracking-[0.3em] font-medium">In every room</span>
            <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
              Room amenities
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {["Air conditioning", "WiFi", "TV", "Wardrobe", "Work desk", "Room service"].map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg border border-gold-400/15 bg-cream/70 min-h-[56px]"
              >
                <Check className="h-4 w-4 text-gold-400 shrink-0" />
                <span className="text-sm text-gold-100 font-medium leading-snug">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Hotel Services Section */}
      <section id="services" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-gold-400 text-xs uppercase tracking-[0.3em] font-medium">On the property</span>
            <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
              Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service 1: Beauty Parlour */}
            <div className="glass-card rounded-lg overflow-hidden border border-gold-400/10 flex flex-col md:flex-row group">
              <div className="relative h-[280px] md:h-[350px] md:w-1/2 overflow-hidden">
                <Image
                  src="/images/parlour/BP001.jpg"
                  alt="Rajhans Ladies Beauty Parlour"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gold-400">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[9px] uppercase tracking-widest font-mono">Beauty</span>
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-gold-50 font-medium tracking-wide">
                    Rajhans Ladies Beauty Parlour
                  </h3>
                  <p className="text-gold-200/60 text-xs leading-relaxed">
                    Hair, skincare, and beauty treatments without leaving the hotel.
                  </p>
                </div>
              </div>
            </div>

            {/* Service 2: Saloon */}
            <div className="glass-card rounded-lg overflow-hidden border border-gold-400/10 flex flex-col md:flex-row group">
              <div className="relative h-[280px] md:h-[350px] md:w-1/2 overflow-hidden bg-paper">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border-b md:border-b-0 md:border-r border-gold-400/10 text-gold-300">
                  <Scissors className="h-10 w-10" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Saloon</span>
                </div>
              </div>
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gold-400">
                    <Scissors className="h-4 w-4" />
                    <span className="text-[9px] uppercase tracking-widest font-mono">Grooming</span>
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-gold-50 font-medium tracking-wide">
                    Rajhans Grooming Saloon
                  </h3>
                  <p className="text-gold-200/60 text-xs leading-relaxed">
                    Haircuts and grooming for men, open to hotel guests.
                  </p>
                </div>
              </div>
            </div>

            {/* Service 3: Takshshila Restaurant */}
            <div className="glass-card rounded-lg overflow-hidden border border-gold-400/10 flex flex-col md:flex-row group">
              <div className="relative h-[280px] md:h-[350px] md:w-1/2 overflow-hidden">
                <Image
                  src="/images/restaurant/R001.jpg"
                  alt="Takshshila Restaurant"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gold-400">
                    <Utensils className="h-4 w-4" />
                    <span className="text-[9px] uppercase tracking-widest font-mono">Dining</span>
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-gold-50 font-medium tracking-wide">
                    Takshshila Restaurant
                  </h3>
                  <p className="text-gold-200/60 text-xs leading-relaxed">
                    Indian, Chinese, and continental meals. Room service available.
                  </p>
                </div>
              </div>
            </div>

            {/* Service 4: Ice Cream Parlour */}
            <div className="glass-card rounded-lg overflow-hidden border border-gold-400/10 flex flex-col md:flex-row group">
              <div className="relative h-[280px] md:h-[350px] md:w-1/2 overflow-hidden">
                <Image
                  src="/images/ice-cream/ICP001.jpg"
                  alt="Ice Cream Parlour"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gold-400">
                    <Coffee className="h-4 w-4" />
                    <span className="text-[9px] uppercase tracking-widest font-mono">Desserts</span>
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-gold-50 font-medium tracking-wide">
                    Ice & Spice
                  </h3>
                  <p className="text-gold-200/60 text-xs leading-relaxed">
                    Ice cream, sundaes, and shakes in the lobby area.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Image Gallery Preview Section (Commented out in favor of dedicated /gallery page) */}
      {/*
      <section id="gallery" className="py-24 bg-cream-soft/60 border-t border-b border-gold-400/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-gold-400 text-xs uppercase tracking-[0.3em] font-medium">Virtual Tour</span>
            <h2 className="font-serif text-3xl md:text-5xl text-brown-900 font-normal tracking-wide">
              Photo Gallery
            </h2>
            <p className="text-sm text-brown-800/80 font-light">
              Explore our grand lobby lounge, luxury suites, Takshshila fine dining hall, beauty parlour, and ice cream parlour.
            </p>
          </div>

          <ImageGallery />

          <div className="pt-4 flex justify-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-brown-900 font-bold uppercase tracking-widest text-xs py-3.5 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <span>Explore Full Dedicated Gallery</span>
              <ArrowRight className="h-4 w-4 text-brown-950" />
            </Link>
          </div>
        </div>
      </section>
      */}

      {/* 10. Testimonials Section */}
      <section id="testimonials" className="py-24 bg-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.03),transparent_60%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-gold-400 text-xs uppercase tracking-[0.3em] font-medium">Reviews</span>
            <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
              What guests say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {reviewsList.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="glass-card rounded-lg p-8 relative flex flex-col justify-between space-y-6"
              >
                <Quote className="absolute top-6 right-8 h-12 w-12 text-gold-400/5 pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <p className="text-gold-100/90 font-normal text-base leading-relaxed italic">
                    &ldquo;{rev.reviewText}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-gold-400/10">
                  <div className="h-10 w-10 bg-gold-400/10 rounded-full flex items-center justify-center border border-gold-400/25">
                    <span className="text-gold-400 font-serif font-bold text-sm">
                      {rev.authorInitials || (rev.authorName ? rev.authorName.substring(0, 2).toUpperCase() : "GR")}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-gold-100 font-semibold font-sans">
                      {rev.authorName}
                    </h4>
                    <p className="text-[10px] text-gold-200/50">{rev.source || "Google review"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ Section */}
      <section id="faq" className="py-24 bg-cream-soft/60 border-t border-b border-gold-400/10">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 space-y-2">
            <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
              Common questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqsList.map((faq, index) => (
              <div
                key={index}
                className="border border-gold-400/10 rounded-lg overflow-hidden bg-cream/40"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left hover:bg-brown-900/5 transition-colors cursor-pointer"
                >
                  <span className="font-serif text-sm md:text-base text-gold-100 tracking-wide font-medium">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: activeFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-gold-400" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-xs md:text-sm text-gold-200/70 leading-relaxed border-t border-gold-400/5 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Bhagalpur & Nearby Tourist Attractions (Moved to dedicated /attraction page) */}
      {/* <AttractionsSection /> */}

      {/* 12. Contact & Map Section */}
      <section id="contact" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <span className="text-gold-400 text-xs uppercase tracking-[0.3em] font-medium">Contact</span>
              <h2 className="font-serif text-3xl md:text-5xl text-gold-50 font-normal tracking-wide">
                Reach us
              </h2>
            </div>

            <div className="space-y-6 text-sm text-gold-200/80">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brown-900/40 border border-gold-400/20 rounded-xl text-gold-400 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-gold-100 font-medium mb-1">Address</h3>
                  <p className="leading-relaxed font-light text-xs sm:text-sm">
                    {cmsSettings.address_full || cmsSettings.address || "Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001, India"}
                  </p>
                  <a
                    href="https://maps.app.goo.gl/77AAPZ7hRje8Nrmk9"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors mt-2 font-medium"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-brown-900/40 border border-gold-400/20 rounded-xl text-gold-400 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-gold-100 font-medium mb-1">Phone</h3>
                  <p className="leading-relaxed font-light font-mono text-xs sm:text-sm">
                    {cmsSettings.phone_primary || "+91 93081 89201"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-brown-900/40 border border-gold-400/20 rounded-xl text-gold-400 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-gold-100 font-medium mb-1">Email</h3>
                  <p className="leading-relaxed font-light font-mono text-xs sm:text-sm">
                    <a href={`mailto:${cmsSettings.email_official || cmsSettings.email_primary || "info@hotelrajhansinternational.com"}`} className="hover:text-gold-300 transition-colors">
                      {cmsSettings.email_official || cmsSettings.email_primary || "info@hotelrajhansinternational.com"}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Enquiry Form */}
            <div className="glass-card rounded-lg p-6 border border-gold-400/10">
              <h3 className="font-serif text-lg text-gold-100 font-medium mb-4">Send a message</h3>
              {contactSuccess ? (
                <div className="text-center py-6 text-gold-400 flex flex-col items-center gap-2">
                  <Check className="h-8 w-8 bg-gold-400/10 p-1.5 rounded-full border border-gold-400/20" />
                  <p className="text-sm font-medium">Message sent</p>
                  <p className="text-[10px] text-gold-200/50">We&apos;ll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="bg-paper border border-gold-400/20 rounded-lg p-2.5 text-xs text-gold-100 focus:outline-none focus:border-gold-400/40 placeholder-gold-200/25"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="bg-paper border border-gold-400/20 rounded-lg p-2.5 text-xs text-gold-100 focus:outline-none focus:border-gold-400/40 placeholder-gold-200/25"
                    />
                  </div>
                  <textarea
                    placeholder="Your message — booking question, pickup request, etc."
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-paper border border-gold-400/20 rounded-lg p-2.5 text-xs text-gold-100 focus:outline-none focus:border-gold-400/40 placeholder-gold-200/25 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gold-400 hover:bg-gold-500 text-brown-900 text-[10px] uppercase font-semibold tracking-widest py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Location & Map Section */}
          <div className="lg:col-span-7">
            <LocationSection />
          </div>
        </div>
      </section>

      {/* 13. Elegant Footer */}
      <footer className="bg-cream border-t border-gold-400/10 text-gold-200/60 text-xs py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Certifications */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <h3 className="font-serif text-lg text-gold-300 font-medium uppercase tracking-[0.2em] leading-none">
              {cmsSettings.hotel_name || "Hotel Rajhans International"}
            </h3>
            <p className="text-gold-200/50 max-w-sm text-xs leading-relaxed font-normal">
              A unit of <span className="text-gold-100 font-medium">{cmsSettings.company_name || "Takshshila Regency Pvt. Ltd."}</span> · {cmsSettings.address_full || "Kachari Chowk, MG Road, Bhagalpur"}.
            </p>
            <div className="flex gap-4 pt-2">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold-300 font-semibold font-mono border border-gold-400/10 bg-brown-900/5 py-1 px-3 rounded">
                <Award className="h-3 w-3 text-gold-400" /> ISO 9001:2015
              </span>
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold-300 font-semibold font-mono border border-gold-400/10 bg-brown-900/5 py-1 px-3 rounded">
                <Clock className="h-3 w-3 text-gold-400" /> Est. 1986
              </span>
            </div>
          </div>

          {/* Quick Sitemap Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-gold-100 font-bold font-sans">
              Sitemap
            </h4>
            <ul className="space-y-2 font-normal">
              <li><a href="#about" className="hover:text-gold-300 transition-colors">About</a></li>
              <li><a href="#rooms" className="hover:text-gold-300 transition-colors">Rooms</a></li>
              <li><a href="#services" className="hover:text-gold-300 transition-colors">Services</a></li>
              <li><Link href="/gallery" className="hover:text-gold-300 transition-colors">Gallery</Link></li>
              <li><Link href="/attraction" className="hover:text-gold-300 transition-colors">Tourist Attractions</Link></li>
              <li><a href="#faq" className="hover:text-gold-300 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Summary */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-gold-100 font-bold font-sans">
              Address & Contact
            </h4>
            <p className="text-xs leading-relaxed font-normal">
              {cmsSettings.address_full || "Kachari Chowk, MG Road, Bhagalpur, Bihar 812001"}
            </p>
            <p className="font-mono text-xs">
              P: {cmsSettings.phone_primary || "+91 93081 89201"}<br />
              WA: <a href="https://wa.me/919308189201?text=Hello%20Hotel%20Rajhans%20International" target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 text-emerald-400">+91 93081 89201</a><br />
              E: <a href={`mailto:${cmsSettings.email_official || "info@hotelrajhansinternational.com"}`} className="hover:text-gold-300">{cmsSettings.email_official || "info@hotelrajhansinternational.com"}</a>
            </p>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-gold-400/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gold-200/30 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Hotel Rajhans International. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            <MapPinHouse className="h-3 w-3 text-gold-400/50" /> A Unit of {cmsSettings.company_name || "Takshshila Regency Pvt. Ltd."}
          </p>
        </div>
      </footer>

      {/* Booking Form Modal Overlay */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedRoomDefault={selectedRoomCategory}
      />

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/919308189201?text=Hello%20Hotel%20Rajhans%20International%2C%20I%20would%20like%20to%20inquire%20about%20room%20availability."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl shadow-emerald-950/40 hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 border border-emerald-400/40 cursor-pointer"
        aria-label="Chat with us on WhatsApp"
      >
        <svg className="w-8 h-8 fill-current text-white" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.127 1.2 4.488L3 21l4.604-1.208a8.947 8.947 0 0 0 4.447 1.185h.004c4.947 0 8.975-4.027 8.977-8.977a8.922 8.922 0 0 0-2.629-6.367zM12.053 19.444h-.003a7.453 7.453 0 0 1-3.799-1.042l-.272-.162-2.824.741.753-2.753-.177-.282a7.457 7.457 0 0 1-1.144-4.01c.002-4.114 3.35-7.461 7.466-7.461a7.417 7.417 0 0 1 5.275 2.187 7.42 7.42 0 0 1 2.183 5.277c-.002 4.114-3.35 7.462-7.458 7.462zm4.091-5.584c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112-.15.224-.58.73-.711.879-.13.15-.262.168-.486.056-.225-.113-.949-.349-1.808-1.115-.668-.596-1.119-1.332-1.25-1.557-.13-.225-.014-.347.099-.459.102-.101.225-.262.337-.393.113-.131.15-.225.225-.375.075-.15.038-.281-.019-.394-.056-.112-.504-1.216-.69-1.666-.182-.439-.367-.379-.504-.386l-.43-.008c-.15 0-.393.056-.599.281-.206.225-.786.768-.786 1.873 0 1.104.804 2.17 0.916 2.32.113.15 1.582 2.416 3.833 3.387.536.231.954.369 1.28.473.538.171 1.027.147 1.414.089.431-.065 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.093-.206-.15-.431-.262z" />
        </svg>
      </a>
    </>
  );
}
