import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import { getCanonicalUrl, HOTEL_INFO, generateHotelSchema } from "@/lib/seo";
import { LOCATION_CONFIG, getGoogleMapsDirectionsUrl } from "@/lib/location";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  CalendarCheck,
  Building,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us & Front Desk Help | Hotel Rajhans International Bhagalpur",
  description:
    "Contact Hotel Rajhans International in Bhagalpur, Bihar. Telephone: +91 93081 89201, email: info@hotelrajhansinternational.com. Address: Kachari Chowk, MG Road. 24/7 reception desk.",
  alternates: {
    canonical: getCanonicalUrl("/contact"),
  },
  openGraph: {
    title: "Contact Us & Front Desk | Hotel Rajhans International Bhagalpur",
    description:
      "Get in touch with Hotel Rajhans International. 24/7 customer service, reservations, and corporate inquiries at Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/contact"),
    type: "website",
  },
};

export default function ContactPage() {
  const hotelSchema = generateHotelSchema();
  const directionsUrl = getGoogleMapsDirectionsUrl();

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs items={[{ name: "Contact Us" }]} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Get in Touch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Contact Hotel Rajhans International
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Our front desk is staffed around the clock. Reach out for room bookings, event reservations,
            station transfers, or general inquiries.
          </p>
        </div>
      </section>

      {/* Main Content & Contact Form */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-cream-soft rounded-3xl border border-brown-900/10 p-6 sm:p-8 space-y-6 shadow-xs">
              <h2 className="font-serif text-2xl font-bold text-brown-950">
                Official Hotel Information
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-brown-800">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-brown-950 block">Address</span>
                    <p className="text-brown-700 leading-relaxed">
                      {HOTEL_INFO.name} (Takshshila Regency Pvt. Ltd.)<br />
                      {LOCATION_CONFIG.hotel.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gold-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-brown-950 block">Phone Support (24/7)</span>
                    <a
                      href={`tel:${HOTEL_INFO.telephone}`}
                      className="text-brown-900 font-mono font-semibold hover:underline block"
                    >
                      {HOTEL_INFO.telephone}
                    </a>
                    <span className="text-xs text-brown-600 font-mono">
                      Landline: {HOTEL_INFO.telephoneLandline}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gold-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-brown-950 block">Email Inquiries</span>
                    <a
                      href={`mailto:${HOTEL_INFO.email}`}
                      className="text-brown-900 hover:underline font-medium"
                    >
                      {HOTEL_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-brown-900/10">
                  <Clock className="h-5 w-5 text-gold-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-brown-950 block">Check-in / Check-out</span>
                    <p className="text-brown-700">Check-in: 12:00 PM (Noon)</p>
                    <p className="text-brown-700">Check-out: 11:00 AM</p>
                    <p className="text-[11px] text-brown-500 mt-1">
                      Front desk and room service run 24 hours daily.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Navigation className="h-4 w-4 text-gold-400" />
                  <span>Get Driving Directions</span>
                </a>
              </div>
            </div>

            {/* Embedded Mini Map */}
            <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-brown-900/15 shadow-xs bg-cream-soft">
              <iframe
                title="Hotel Rajhans International Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.2045618141443!2d86.9865113!3d25.2505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f049f7b6b4843b%3A0x75bf8b9596768585!2sHotel%20Rajhans%20International!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
