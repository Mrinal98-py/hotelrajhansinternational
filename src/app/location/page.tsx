import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO, generateHotelSchema } from "@/lib/seo";
import { LOCATION_CONFIG, getGoogleMapsDirectionsUrl } from "@/lib/location";
import {
  MapPin,
  Train,
  Car,
  Compass,
  Phone,
  Mail,
  Navigation,
  ExternalLink,
  Clock,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Location & Directions | Hotel Rajhans International Bhagalpur",
  description:
    "Find Hotel Rajhans International at Kachari Chowk, MG Road, Bhagalpur, Bihar. Directions from Bhagalpur Junction (BGP) railway station, maps, and nearby landmarks.",
  alternates: {
    canonical: getCanonicalUrl("/location"),
  },
  openGraph: {
    title: "Location & Directions | Hotel Rajhans International Bhagalpur",
    description:
      "Centrally situated at Kachari Chowk on MG Road, Bhagalpur. Walking distance to district courts, commercial centers, and 2 km from Bhagalpur Junction.",
    url: getCanonicalUrl("/location"),
    type: "website",
  },
};

const LANDMARKS = [
  {
    name: "Bhagalpur Junction Railway Station (BGP)",
    distance: "2.1 km",
    travelTime: "7 - 10 mins by cab/auto",
    type: "Transit Hub",
    description: "Main railway junction connecting Patna, Kolkata, Delhi, and Guwahati.",
  },
  {
    name: "District Court & Collectorate",
    distance: "250 meters",
    travelTime: "3 mins walking",
    type: "Government / Legal",
    description: "Adjacent to Kachari Chowk administrative and legal hub.",
  },
  {
    name: "MG Road Commercial Market",
    distance: "100 meters",
    travelTime: "Immediate access",
    type: "Shopping & Banks",
    description: "Major banking branches, ATM kiosks, and silk apparel stores.",
  },
  {
    name: "Sandis Compound / Sports Complex",
    distance: "1.2 km",
    travelTime: "5 mins driving",
    type: "Recreation & Parks",
    description: "Prominent open-air public grounds and jogging track.",
  },
  {
    name: "Tilka Manjhi Bhagalpur University (TMBU)",
    distance: "3.2 km",
    travelTime: "12 mins driving",
    type: "Academic Institution",
    description: "Premier state university of the Silk City.",
  },
  {
    name: "Barari Ghat (River Ganga)",
    distance: "2.8 km",
    travelTime: "10 mins driving",
    type: "Cultural & Riverfront",
    description: "Historic sacred riverfront overlooking the Ganges.",
  },
];

export default function LocationPage() {
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
          <div className="mb-3">
            <Breadcrumbs
              items={[{ name: "Location & Directions", url: "/location" }]}
              currentUrl="/location"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Prime Central Address
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Hotel Location & Driving Directions
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Situated at Kachari Chowk on Mahatma Gandhi (MG) Road in Bhagalpur, Bihar — offering
            unmatched accessibility to the railway junction, administrative offices, and tourist gateways.
          </p>
        </div>
      </section>

      {/* Map & Core Location Card */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Map & Interactive Directions */}
          <div className="lg:col-span-8 space-y-8">
            {/* Google Maps Embed */}
            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-brown-900/15 shadow-sm bg-cream-soft">
              <iframe
                title="Hotel Rajhans International Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.2045618141443!2d86.9865113!3d25.2505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f049f7b6b4843b%3A0x75bf8b9596768585!2sHotel%20Rajhans%20International!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* How to Reach Us */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                How to Reach Hotel Rajhans International
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-brown-800/90 leading-relaxed">
                <div className="p-4 rounded-xl bg-cream-soft border border-brown-900/10 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-brown-950">
                    <Train className="h-4 w-4 text-gold-700" />
                    <span>From Bhagalpur Junction (BGP) Railway Station (2.1 km)</span>
                  </div>
                  <p>
                    Exit the station through the main station circle towards Station Chowk. Take
                    MG Road directly north for approximately 2 kilometers until reaching Kachari
                    Chowk. Hotel Rajhans International is prominently situated at Kachari Chowk.
                    Pre-arranged station transfers are available via our front desk.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-cream-soft border border-brown-900/10 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-brown-950">
                    <Car className="h-4 w-4 text-gold-700" />
                    <span>By Road (NH 33 / Vikramshila Bridge / Vikramshila Setu)</span>
                  </div>
                  <p>
                    Arriving via NH 33 or crossing the Vikramshila Setu from North Bihar, proceed
                    towards Zero Mile and enter City Center via Tilka Manjhi Chowk. Follow MG Road
                    southwest toward Kachari Chowk. Secure on-site private parking is available.
                  </p>
                </div>
              </div>
            </div>

            {/* Nearby Key Landmarks */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-4">
                Nearby Landmarks & Distance Matrix
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LANDMARKS.map((lm, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gold-800 font-bold">
                          {lm.type}
                        </span>
                        <span className="font-mono font-bold text-xs text-brown-950 bg-brown-900/10 px-2 py-0.5 rounded">
                          {lm.distance}
                        </span>
                      </div>
                      <h3 className="font-serif text-sm font-bold text-brown-950">{lm.name}</h3>
                      <p className="text-xs text-brown-700 leading-relaxed mt-1">
                        {lm.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-brown-900/10 text-[11px] font-medium text-brown-600 flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-brown-500" />
                      <span>{lm.travelTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Address & Quick Actions */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-gold-400/30 rounded-2xl p-6 shadow-sm sticky top-24">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brown-700 font-bold block mb-1">
                Official Property Address
              </span>
              <h3 className="font-serif text-xl font-bold text-brown-950 mb-3">
                Hotel Rajhans International
              </h3>

              <div className="space-y-4 text-xs text-brown-800 mb-6">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-brown-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-semibold text-brown-950">Takshshila Regency Pvt. Ltd.</p>
                    <p>{LOCATION_CONFIG.hotel.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-brown-700 shrink-0" />
                  <div>
                    <a href={`tel:${HOTEL_INFO.telephone}`} className="hover:underline font-semibold text-brown-950 block">
                      {HOTEL_INFO.telephone}
                    </a>
                    <span className="text-[11px] text-brown-600">Landline: {HOTEL_INFO.telephoneLandline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-brown-700 shrink-0" />
                  <a href={`mailto:${HOTEL_INFO.email}`} className="hover:underline font-semibold text-brown-950">
                    {HOTEL_INFO.email}
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Navigation className="h-4 w-4 text-gold-400" />
                  <span>Get Driving Directions</span>
                </a>

                <Link
                  href="/booking"
                  className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-colors"
                >
                  <CalendarCheck className="h-4 w-4 text-gold-600" />
                  <span>Book Your Stay</span>
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-brown-900/10 text-[11px] text-brown-600 space-y-1">
                <p>• Coordinates: 25.2505° N, 86.9887° E</p>
                <p>• Free secure guest parking available on premises</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
