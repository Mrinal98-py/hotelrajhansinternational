import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import {
  Bed,
  Users,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  Coffee,
  Sparkles,
  Wifi,
  Wind,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Rooms & Suites in Bhagalpur | Hotel Rajhans International",
  description:
    "Explore luxury accommodation at Hotel Rajhans International, Bhagalpur. Choose AC Executive rooms, AC Deluxe rooms, or Royal Suites with modern amenities, fine dining, and prime MG Road location.",
  alternates: {
    canonical: getCanonicalUrl("/rooms"),
  },
  openGraph: {
    title: "Rooms & Suites in Bhagalpur | Hotel Rajhans International",
    description:
      "Comfortable and luxury stays in Bhagalpur. Choose from AC Executive, AC Deluxe, and Royal Suite rooms near Bhagalpur Junction.",
    url: getCanonicalUrl("/rooms"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/suite/SR001.jpg`,
        width: 1200,
        height: 800,
        alt: "Hotel Rajhans International Rooms and Suites",
      },
    ],
  },
};

const ROOM_DATA = [
  {
    slug: "ac-executive",
    typeKey: "EXECUTIVE",
    name: "AC Executive Room",
    tagline: "Ideal for Solo Travelers & Business Executives",
    description:
      "Thoughtfully designed for single travelers and corporate guests. Features climate-controlled air conditioning, work desk with ergonomic seating, satellite TV, wardrobe, and complimentary high-speed Wi-Fi.",
    image: "/images/executive/Room-001.jpg",
    alt: "AC Executive Room at Hotel Rajhans International Bhagalpur",
    singlePrice: 3790,
    doublePrice: 4490,
    occupancy: "1 - 2 Guests",
    bedType: "Standard Queen Bed",
    features: [
      "Standard Comfort Bed",
      "Executive Study / Work Table",
      "Air Conditioning (Climate Controlled)",
      "LED TV with HD Satellite Channels",
      "Large Wardrobe & Luggage Storage",
      "Complimentary High-Speed Wi-Fi",
      "Welcome Fruit Basket on Arrival",
      "24/7 Room Service & Housekeeping",
    ],
  },
  {
    slug: "ac-deluxe",
    typeKey: "DELUXE",
    name: "AC Deluxe Room",
    tagline: "Enhanced Space with Pocket-Spring Comfort",
    description:
      "Spacious rooms appointed with premium pocket-spring mattresses, seating corner, and serene interior styling. Ideal for couples, leisure travelers, and extended business stays in Bhagalpur.",
    image: "/images/deluxe/Delux001.jpg",
    alt: "AC Deluxe Room with Pocket Spring Bed in Bhagalpur",
    singlePrice: 3790,
    doublePrice: 4490,
    occupancy: "1 - 2 Guests",
    bedType: "Premium Pocket-Spring Bed",
    features: [
      "Pocket-Spring Spine Support Mattress",
      "Spacious Bedroom with Seating Area",
      "Executive Study Table",
      "Air Conditioning (Silent Cooling)",
      "Flat-screen TV with Entertainment Channels",
      "Spacious Wardrobe & Full-length Mirror",
      "Welcome Fruit Basket on Arrival",
      "Round-the-clock In-room Dining",
    ],
  },
  {
    slug: "royal-suite",
    typeKey: "ROYAL_SUITE",
    name: "Royal Suite",
    tagline: "The Pinnacle of Hospitality & Space in Bhagalpur",
    description:
      "Expansive executive suite featuring an independent master bedroom, a private furnished living room, and two attached washrooms. Equipped with refrigerator, plush sofas, and personalized concierge care.",
    image: "/images/suite/SR001.jpg",
    alt: "Royal Suite Master Bedroom and Living Area Bhagalpur",
    singlePrice: 5190,
    doublePrice: 5190,
    occupancy: "Up to 4 Guests",
    bedType: "King Bed + Separate Living Lounge",
    features: [
      "Separate Master Bedroom & Living Lounge",
      "Double En-suite Washrooms",
      "Mini Refrigerator / Chiller",
      "Plush Sofa Seating Area",
      "Executive Work Desk with Lamp",
      "Dual Air Conditioning Units",
      "Welcome Fruit Basket & Refreshments",
      "Dedicated Room Service Assistance",
    ],
  },
];

export default async function RoomsPage() {
  // Fetch dynamic rates or status if present in DB
  let dynamicRooms: any[] = [];
  try {
    dynamicRooms = await prisma.room.findMany({
      include: { amenities: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch (err) {
    console.error("DB Fetch Error in RoomsPage:", err);
  }

  // Merge dynamic prices if available
  const rooms = ROOM_DATA.map((item) => {
    const dbMatch = dynamicRooms.find((r) => r.type === item.typeKey);
    return {
      ...item,
      singlePrice: dbMatch?.basePriceSingle ?? item.singlePrice,
      doublePrice: dbMatch?.basePriceDouble ?? item.doublePrice,
      dbAmenities: dbMatch?.amenities?.map((a: any) => a.amenityName) ?? [],
    };
  });

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[{ name: "Rooms & Suites", url: "/rooms" }]}
              currentUrl="/rooms"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Hospitality & Comfort
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Rooms & Luxury Suites in Bhagalpur
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Experience restful hospitality at Hotel Rajhans International. Each room category is
            engineered for peaceful sleep, productivity, and modern convenience at Kachari Chowk, MG Road.
          </p>
        </div>
      </section>

      {/* Main Rooms Grid */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="space-y-12">
          {rooms.map((room, idx) => (
            <article
              key={room.slug}
              className="bg-cream-soft border border-brown-900/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              {/* Image Preview */}
              <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[280px]">
                <Image
                  src={room.image}
                  alt={room.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority={idx === 0}
                />
                <div className="absolute top-4 left-4 bg-brown-950/85 backdrop-blur-md text-gold-300 text-[11px] font-mono uppercase px-3 py-1 rounded-full border border-gold-400/30">
                  {room.occupancy}
                </div>
              </div>

              {/* Content Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h2 className="font-serif text-2xl font-bold text-brown-950">
                      <Link
                        href={`/rooms/${room.slug}`}
                        className="hover:text-brown-700 transition-colors"
                      >
                        {room.name}
                      </Link>
                    </h2>
                    <div className="text-right">
                      <span className="text-xs text-brown-600 font-medium block">Starting from</span>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-brown-950">
                        ₹{room.singlePrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-brown-600 block">/ night (excl. tax)</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-brown-700 mb-3">
                    {room.tagline}
                  </p>

                  <p className="text-sm text-brown-800/90 leading-relaxed mb-6">
                    {room.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-xs text-brown-900">
                    {room.features.slice(0, 6).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gold-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-4 border-t border-brown-900/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs text-brown-700">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Bed className="h-4 w-4 text-brown-600" />
                      {room.bedType}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Wind className="h-4 w-4 text-brown-600" />
                      Air Conditioned
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/rooms/${room.slug}`}
                      className="px-4 py-2 text-xs font-bold text-brown-900 hover:text-brown-700 border border-brown-900/20 rounded-xl hover:bg-brown-900/5 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Room Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <Link
                      href={`/booking?room=${room.slug}`}
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

      {/* Comparison Matrix Section */}
      <section className="bg-cream/60 border-t border-brown-900/10 py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-brown-700 font-bold block mb-1">
              At A Glance
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brown-950">
              Room Category Comparison
            </h2>
            <p className="text-xs sm:text-sm text-brown-700 mt-2">
              Select the best accommodation suited for your stay requirements in Bhagalpur.
            </p>
          </div>

          <div className="overflow-x-auto bg-cream-soft rounded-2xl border border-brown-900/15 shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-brown-950 text-cream text-[11px] uppercase tracking-wider font-mono">
                  <th className="p-4 font-semibold">Features</th>
                  <th className="p-4 font-semibold">AC Executive</th>
                  <th className="p-4 font-semibold">AC Deluxe</th>
                  <th className="p-4 font-semibold">Royal Suite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown-900/10 text-brown-900">
                <tr>
                  <td className="p-4 font-semibold text-brown-950">Single Occupancy Rate</td>
                  <td className="p-4">₹3,790 / night</td>
                  <td className="p-4">₹3,790 / night</td>
                  <td className="p-4">₹5,190 / night</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-brown-950">Double Occupancy Rate</td>
                  <td className="p-4">₹4,490 / night</td>
                  <td className="p-4">₹4,490 / night</td>
                  <td className="p-4">₹5,190 / night</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-brown-950">Bed Type</td>
                  <td className="p-4">Standard Comfort Bed</td>
                  <td className="p-4">Pocket-Spring Spine Bed</td>
                  <td className="p-4">King Bed + Living Area</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-brown-950">Washroom Layout</td>
                  <td className="p-4">1 En-suite Washroom</td>
                  <td className="p-4">1 En-suite Washroom</td>
                  <td className="p-4 font-semibold text-gold-800">2 Independent Washrooms</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-brown-950">Living Area / Sofa</td>
                  <td className="p-4">Study Chair</td>
                  <td className="p-4">Seating Corner</td>
                  <td className="p-4 font-semibold text-gold-800">Separate Living Lounge & Sofas</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-brown-950">Mini Refrigerator</td>
                  <td className="p-4 text-brown-400">—</td>
                  <td className="p-4 text-brown-400">—</td>
                  <td className="p-4 text-gold-800 font-semibold">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-brown-950">Free Wi-Fi & AC</td>
                  <td className="p-4">Included</td>
                  <td className="p-4">Included</td>
                  <td className="p-4">Included (Dual Units)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Booking Assurance Banner */}
      <section className="bg-brown-950 text-cream py-12 px-6 border-t border-gold-400/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Guaranteed Best Rate & Direct Booking Perks
            </h3>
            <p className="text-xs sm:text-sm text-cream-soft/80">
              Instant confirmation, zero hidden fees, and seamless Cashfree checkout for all rooms.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-brown-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Reserve Online</span>
            </Link>
            <a
              href={`tel:${HOTEL_INFO.telephone}`}
              className="px-5 py-3 rounded-xl border border-gold-400/40 text-cream hover:bg-white/5 font-semibold text-xs transition-colors"
            >
              Call Front Desk
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
