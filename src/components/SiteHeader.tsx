"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  CalendarCheck,
} from "lucide-react";
import { HOTEL_INFO } from "@/lib/seo";

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [roomsDropdownOpen, setRoomsDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setRoomsDropdownOpen(false);
    setServicesDropdownOpen(false);
  }, [pathname]);

  return (
    <>
      {/* 1. Top Announcement / Quick Contact Bar */}
      <header className="w-full text-slate-800 text-xs bg-cream-soft/90 border-b border-brown-900/10 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[11px] font-medium text-brown-800">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-brown-600" />
              {HOTEL_INFO.address.streetAddress}, {HOTEL_INFO.address.addressLocality}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-brown-600" />
              <a href={`mailto:${HOTEL_INFO.email}`} className="hover:underline">
                {HOTEL_INFO.email}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-5 text-[11px] font-semibold text-brown-900">
            <a
              href={`tel:${HOTEL_INFO.telephone}`}
              className="flex items-center gap-1.5 hover:text-brown-700 transition-colors"
            >
              <Phone className="h-3 w-3 text-brown-600" />
              <span>Call: {HOTEL_INFO.telephone}</span>
            </a>
            <Link
              href="/offers"
              className="px-2 py-0.5 rounded bg-brown-900/10 text-brown-900 text-[10px] font-bold uppercase tracking-wider hover:bg-brown-900/15"
            >
              Special Offers
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Navigation Bar */}
      <nav
        aria-label="Main Navigation"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-cream/95 backdrop-blur-md shadow-md border-b border-brown-900/15 py-3"
            : "bg-cream/90 backdrop-blur-sm border-b border-brown-900/10 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brown-900 group-hover:text-brown-700 transition-colors">
              Hotel Rajhans
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-brown-600 -mt-0.5">
              International • Bhagalpur
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-brown-900">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-brown-600 ${
                pathname === "/" ? "font-bold text-brown-950 bg-brown-900/5" : ""
              }`}
            >
              Home
            </Link>

            {/* Rooms Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setRoomsDropdownOpen(true)}
              onMouseLeave={() => setRoomsDropdownOpen(false)}
            >
              <Link
                href="/rooms"
                className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors hover:text-brown-600 ${
                  pathname.startsWith("/rooms") ? "font-bold text-brown-950 bg-brown-900/5" : ""
                }`}
              >
                <span>Rooms & Suites</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Link>

              {roomsDropdownOpen && (
                <div className="absolute left-0 top-full pt-1 w-56 z-50 animate-fade-in">
                  <div className="bg-cream-soft border border-brown-900/15 rounded-xl shadow-xl p-2 space-y-1">
                    <Link
                      href="/rooms"
                      className="block px-3 py-2 rounded-lg text-xs font-bold text-brown-950 hover:bg-brown-900/10"
                    >
                      All Rooms Overview
                    </Link>
                    <div className="h-px bg-brown-900/10 my-1" />
                    <Link
                      href="/rooms/ac-executive"
                      className="block px-3 py-2 rounded-lg text-xs hover:bg-brown-900/10"
                    >
                      <div className="font-semibold text-brown-900">AC Executive</div>
                      <div className="text-[10px] text-brown-600">From ₹3,790 • Solo & Business</div>
                    </Link>
                    <Link
                      href="/rooms/ac-deluxe"
                      className="block px-3 py-2 rounded-lg text-xs hover:bg-brown-900/10"
                    >
                      <div className="font-semibold text-brown-900">AC Deluxe</div>
                      <div className="text-[10px] text-brown-600">From ₹3,790 • Pocket-Spring Comfort</div>
                    </Link>
                    <Link
                      href="/rooms/royal-suite"
                      className="block px-3 py-2 rounded-lg text-xs hover:bg-brown-900/10"
                    >
                      <div className="font-semibold text-brown-900">Royal Suite</div>
                      <div className="text-[10px] text-brown-600">From ₹5,190 • 2 Washrooms & Lounge</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <Link
                href="/services"
                className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors hover:text-brown-600 ${
                  pathname.startsWith("/services") ? "font-bold text-brown-950 bg-brown-900/5" : ""
                }`}
              >
                <span>Services</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Link>

              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full pt-1 w-52 z-50 animate-fade-in">
                  <div className="bg-cream-soft border border-brown-900/15 rounded-xl shadow-xl p-2 space-y-1">
                    <Link
                      href="/services"
                      className="block px-3 py-2 rounded-lg text-xs font-bold text-brown-950 hover:bg-brown-900/10"
                    >
                      All Services
                    </Link>
                    <div className="h-px bg-brown-900/10 my-1" />
                    <Link
                      href="/services/room-service"
                      className="block px-3 py-1.5 rounded-lg text-xs hover:bg-brown-900/10 text-brown-800"
                    >
                      24/7 Room Service
                    </Link>
                    <Link
                      href="/services/restaurant"
                      className="block px-3 py-1.5 rounded-lg text-xs hover:bg-brown-900/10 text-brown-800"
                    >
                      Takshshila Restaurant
                    </Link>
                    <Link
                      href="/services/laundry"
                      className="block px-3 py-1.5 rounded-lg text-xs hover:bg-brown-900/10 text-brown-800"
                    >
                      Laundry & Dry Cleaning
                    </Link>
                    <Link
                      href="/services/wifi"
                      className="block px-3 py-1.5 rounded-lg text-xs hover:bg-brown-900/10 text-brown-800"
                    >
                      High-Speed Wi-Fi
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/restaurant"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-brown-600 ${
                pathname === "/restaurant" ? "font-bold text-brown-950 bg-brown-900/5" : ""
              }`}
            >
              Restaurant
            </Link>

            <Link
              href="/facilities"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-brown-600 ${
                pathname === "/facilities" ? "font-bold text-brown-950 bg-brown-900/5" : ""
              }`}
            >
              Facilities
            </Link>

            <Link
              href="/gallery"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-brown-600 ${
                pathname === "/gallery" ? "font-bold text-brown-950 bg-brown-900/5" : ""
              }`}
            >
              Gallery
            </Link>

            <Link
              href="/attractions"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-brown-600 ${
                pathname.startsWith("/attraction") ? "font-bold text-brown-950 bg-brown-900/5" : ""
              }`}
            >
              Attractions
            </Link>

            <Link
              href="/location"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-brown-600 ${
                pathname === "/location" ? "font-bold text-brown-950 bg-brown-900/5" : ""
              }`}
            >
              Location
            </Link>

            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-brown-600 ${
                pathname === "/about" ? "font-bold text-brown-950 bg-brown-900/5" : ""
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-brown-600 ${
                pathname === "/contact" ? "font-bold text-brown-950 bg-brown-900/5" : ""
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Book Now Action & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <CalendarCheck className="h-3.5 w-3.5 text-gold-600" />
              <span>Book Now</span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-brown-900/20 text-brown-900 hover:bg-brown-900/5 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 3. Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-full bg-cream-soft border-b border-brown-900/20 shadow-2xl p-6 max-h-[85vh] overflow-y-auto space-y-4 animate-fade-in text-brown-900">
            <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
              <Link href="/" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Home
              </Link>
              <Link href="/rooms" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Rooms & Suites
              </Link>
              <Link href="/rooms/ac-executive" className="p-2 rounded-lg text-xs text-brown-700 pl-4">
                • AC Executive
              </Link>
              <Link href="/rooms/ac-deluxe" className="p-2 rounded-lg text-xs text-brown-700 pl-4">
                • AC Deluxe
              </Link>
              <Link href="/rooms/royal-suite" className="p-2 rounded-lg text-xs text-brown-700 pl-4 col-span-2">
                • Royal Suite
              </Link>
              <Link href="/services" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Services
              </Link>
              <Link href="/restaurant" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Restaurant
              </Link>
              <Link href="/facilities" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Facilities
              </Link>
              <Link href="/gallery" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Gallery
              </Link>
              <Link href="/attractions" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Attractions
              </Link>
              <Link href="/location" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Location
              </Link>
              <Link href="/about" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                About Hotel
              </Link>
              <Link href="/reviews" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Guest Reviews
              </Link>
              <Link href="/faq" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                FAQs
              </Link>
              <Link href="/offers" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Offers
              </Link>
              <Link href="/contact" className="p-2.5 rounded-lg bg-cream/50 hover:bg-cream">
                Contact Us
              </Link>
            </div>

            <div className="pt-2 border-t border-brown-900/10 space-y-2">
              <Link
                href="/booking"
                className="w-full py-3 rounded-xl bg-brown-900 text-cream font-bold text-center text-xs uppercase tracking-wider block shadow-sm"
              >
                Book Your Stay
              </Link>
              <a
                href={`tel:${HOTEL_INFO.telephone}`}
                className="w-full py-2.5 rounded-xl border border-brown-900/30 text-brown-900 font-semibold text-center text-xs block"
              >
                Call Front Desk: {HOTEL_INFO.telephone}
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
