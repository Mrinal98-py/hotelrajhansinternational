import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";
import { HOTEL_INFO } from "@/lib/seo";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-cream-soft border-t border-brown-900/15 text-brown-900 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand & NAP */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight text-brown-950 block">
                {HOTEL_INFO.name}
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brown-700 block">
                Takshshila Regency Pvt. Ltd. • ISO 9001:2015
              </span>
            </Link>

            <p className="text-xs text-brown-800 leading-relaxed max-w-sm">
              Premier luxury hospitality at Kachari Chowk, MG Road, Bhagalpur. Offering 33 well-appointed rooms, fine dining at Takshshila Restaurant, and round-the-clock service.
            </p>

            <div className="space-y-2 text-xs text-brown-900 pt-2 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-brown-600 shrink-0 mt-0.5" />
                <span>{HOTEL_INFO.address.streetAddress}, {HOTEL_INFO.address.addressLocality}, {HOTEL_INFO.address.addressRegion} – {HOTEL_INFO.address.postalCode}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-brown-600 shrink-0" />
                <a href={`tel:${HOTEL_INFO.telephone}`} className="hover:underline">
                  {HOTEL_INFO.telephone}
                </a>
                <span className="text-brown-500">/</span>
                <span className="text-brown-700">{HOTEL_INFO.telephoneLandline}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-brown-600 shrink-0" />
                <a href={`mailto:${HOTEL_INFO.email}`} className="hover:underline">
                  {HOTEL_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-brown-700 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-brown-600 shrink-0" />
                <span>Check-In: 12:00 PM • Check-Out: 11:00 AM</span>
              </div>
            </div>
          </div>

          {/* Column 2: Rooms & Suites */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-brown-950 font-bold border-b border-brown-900/10 pb-1">
              Rooms & Suites
            </h4>
            <ul className="space-y-2 text-xs font-medium text-brown-800">
              <li>
                <Link href="/rooms" className="hover:text-brown-950 hover:underline">
                  All Rooms Overview
                </Link>
              </li>
              <li>
                <Link href="/rooms/ac-executive" className="hover:text-brown-950 hover:underline">
                  AC Executive Rooms
                </Link>
              </li>
              <li>
                <Link href="/rooms/ac-deluxe" className="hover:text-brown-950 hover:underline">
                  AC Deluxe Rooms
                </Link>
              </li>
              <li>
                <Link href="/rooms/royal-suite" className="hover:text-brown-950 hover:underline">
                  Royal Suite Rooms
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brown-900 text-cream text-[11px] font-bold uppercase tracking-wider shadow-xs hover:bg-brown-800"
                >
                  <CalendarCheck className="h-3 w-3 text-gold-600" />
                  <span>Book Room</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Dining & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-brown-950 font-bold border-b border-brown-900/10 pb-1">
              Dining & Services
            </h4>
            <ul className="space-y-2 text-xs font-medium text-brown-800">
              <li>
                <Link href="/restaurant" className="hover:text-brown-950 hover:underline">
                  Takshshila Restaurant
                </Link>
              </li>
              <li>
                <Link href="/services/room-service" className="hover:text-brown-950 hover:underline">
                  24/7 Room Service
                </Link>
              </li>
              <li>
                <Link href="/services/laundry" className="hover:text-brown-950 hover:underline">
                  Laundry & Dry Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services/wifi" className="hover:text-brown-950 hover:underline">
                  High-Speed Wi-Fi
                </Link>
              </li>
              <li>
                <Link href="/facilities" className="hover:text-brown-950 hover:underline">
                  Hotel Facilities & Parking
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-brown-950 hover:underline">
                  All Services Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Explore & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-brown-950 font-bold border-b border-brown-900/10 pb-1">
              Explore & Policies
            </h4>
            <ul className="space-y-2 text-xs font-medium text-brown-800">
              <li>
                <Link href="/location" className="hover:text-brown-950 hover:underline">
                  Hotel Location & Maps
                </Link>
              </li>
              <li>
                <Link href="/attractions" className="hover:text-brown-950 hover:underline">
                  Bhagalpur Attractions
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-brown-950 hover:underline">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brown-950 hover:underline">
                  About Hotel Rajhans
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-brown-950 hover:underline">
                  Guest Reviews
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brown-950 hover:underline">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-brown-950 hover:underline">
                  Exclusive Offers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brown-950 hover:underline">
                  Contact & Inquiries
                </Link>
              </li>
              <li className="pt-1 text-[11px] text-brown-700">
                <Link href="/cancellation-policy" className="hover:underline">
                  Cancellation Policy
                </Link>{" "}
                •{" "}
                <Link href="/terms-and-conditions" className="hover:underline">
                  Terms
                </Link>{" "}
                •{" "}
                <Link href="/privacy-policy" className="hover:underline">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Certifications */}
        <div className="pt-8 border-t border-brown-900/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-brown-800 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brown-600" />
            <span>
              © {currentYear} {HOTEL_INFO.name}. Operated by {HOTEL_INFO.legalName}. All Rights Reserved.
            </span>
          </div>

          <div className="flex items-center gap-4 text-brown-700">
            <span>Kachari Chowk, MG Road, Bhagalpur</span>
            <span>•</span>
            <Link href="/sitemap.xml" className="hover:underline">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
