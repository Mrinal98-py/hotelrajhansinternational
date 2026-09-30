import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO, generateRoomSchema, generateFaqSchema } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import {
  Bed,
  Users,
  CheckCircle2,
  CalendarCheck,
  Phone,
  ShieldCheck,
  Tv,
  Wifi,
  Wind,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AC Deluxe Rooms in Bhagalpur | Hotel Rajhans International",
  description:
    "Experience superior comfort in AC Deluxe Rooms at Hotel Rajhans International, Bhagalpur. Pocket-spring mattresses, generous floor space, LCD TV, and high-speed Wi-Fi.",
  alternates: {
    canonical: getCanonicalUrl("/rooms/ac-deluxe"),
  },
  openGraph: {
    title: "AC Deluxe Rooms in Bhagalpur | Hotel Rajhans International",
    description:
      "Spacious air-conditioned deluxe accommodation with premium pocket-spring beds, work table, and 24/7 dining at MG Road, Bhagalpur.",
    url: getCanonicalUrl("/rooms/ac-deluxe"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/deluxe/Delux001.jpg`,
        width: 1200,
        height: 800,
        alt: "AC Deluxe Room with Pocket Spring Bed Hotel Rajhans International Bhagalpur",
      },
    ],
  },
};

const ROOM_GALLERY = [
  { src: "/images/deluxe/Delux001.jpg", alt: "AC Deluxe Room Premium Pocket Spring Bed Bhagalpur" },
  { src: "/images/deluxe/Delux002.jpg", alt: "AC Deluxe Room Living and Study Space Layout" },
  { src: "/images/deluxe/Delux003.jpg", alt: "AC Deluxe Room Bedside Lighting and Wardrobe" },
  { src: "/images/deluxe/Delux004.jpg", alt: "AC Deluxe Room Pristine Attached Bathroom" },
];

const ROOM_FAQS = [
  {
    question: "How does the AC Deluxe Room differ from the Executive Room?",
    answer:
      "The AC Deluxe Room provides a larger square footage layout with an upgraded pocket-spring orthopedic mattress that provides superior spine support and sleep comfort, along with an expanded seating area.",
  },
  {
    question: "What is the tariff for the AC Deluxe Room?",
    answer:
      "The AC Deluxe Room starts at ₹3,790 per night for single occupancy and ₹4,490 per night for double occupancy (taxes extra). Includes high-speed Wi-Fi and direct access to hotel amenities.",
  },
  {
    question: "Can an extra bed or guest be accommodated in the Deluxe Room?",
    answer:
      "Yes, an extra rollaway bed can be provided in the AC Deluxe Room upon request at ₹600 per night subject to availability.",
  },
  {
    question: "Is high-speed Wi-Fi included in the Deluxe Room rate?",
    answer:
      "Yes, complimentary high-speed Wi-Fi is provided throughout the hotel, including high-bandwidth access inside all Deluxe rooms.",
  },
];

export default async function AcDeluxePage() {
  let dbRoom: any = null;
  try {
    dbRoom = await prisma.room.findFirst({
      where: { type: "DELUXE" },
      include: { amenities: true },
    });
  } catch (err) {
    console.error("DB Deluxe Room Fetch Error:", err);
  }

  const singlePrice = dbRoom?.basePriceSingle ?? 3790;
  const doublePrice = dbRoom?.basePriceDouble ?? 4490;
  const amenitiesList =
    dbRoom?.amenities?.map((a: any) => a.amenityName) || [
      "Pocket Spring Bed",
      "Study Table",
      "Fruit Basket",
      "TV",
      "Large Wardrobe",
      "A/C",
    ];

  const roomSchema = generateRoomSchema({
    name: "AC Deluxe Room",
    description:
      "Spacious air-conditioned deluxe accommodation with premium pocket-spring beds, work table, and 24/7 room service at Hotel Rajhans International, Bhagalpur.",
    url: "/rooms/ac-deluxe",
    image: "/images/deluxe/Delux001.jpg",
    priceSingle: singlePrice,
    priceDouble: doublePrice,
    occupancy: 2,
    bedType: "Pocket-Spring Bed",
    amenities: amenitiesList,
  });

  const faqSchema = generateFaqSchema(ROOM_FAQS);

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roomSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-10 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[
                { name: "Rooms & Suites", url: "/rooms" },
                { name: "AC Deluxe", url: "/rooms/ac-deluxe" },
              ]}
              currentUrl="/rooms/ac-deluxe"
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
                Enhanced Comfort & Spine Support
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                AC Deluxe Rooms in Bhagalpur
              </h1>
              <p className="text-xs sm:text-sm text-cream-soft/80 mt-2 max-w-xl">
                Expanded floor area and pocket-spring mattresses for a tranquil, rejuvenating sleep.
              </p>
            </div>

            <div className="bg-cream/10 border border-gold-400/30 rounded-2xl p-4 backdrop-blur-md flex items-center gap-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-gold-300 block">
                  Tariff (Excl. Tax)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    ₹{singlePrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-cream-soft">/ Single</span>
                </div>
                <div className="text-[11px] text-cream-soft/80">
                  ₹{doublePrice.toLocaleString("en-IN")} / Double Occupancy
                </div>
              </div>

              <Link
                href="/booking?room=ac-deluxe"
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-brown-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>Book Deluxe</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Grid */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
            <Image
              src={ROOM_GALLERY[0].src}
              alt={ROOM_GALLERY[0].alt}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            {ROOM_GALLERY.slice(1, 3).map((img, idx) => (
              <div key={idx} className="relative h-38 sm:h-46 rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Details & Content */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Description */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Uncompromising Rest with Pocket-Spring Engineering
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Designed for discerning guests who place high value on uninterrupted rest, our
                AC Deluxe Rooms feature custom-crafted pocket-spring mattresses that isolate motion
                and contour naturally to the spine. Whether traveling for leisure with family or
                visiting Bhagalpur for corporate projects, the deluxe category ensures maximum relaxation.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                The interior is adorned with warm earth tones, generous wardrobe storage, an executive
                study desk, and a cozy seating area. Guests enjoy high-definition television channels,
                whisper-quiet air conditioning, and prompt room service from our signature Takshshila Restaurant.
              </p>
            </div>

            {/* Key Amenities */}
            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Deluxe Room Amenities & Inclusions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-brown-900">
                {amenitiesList.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Orthopedic Pocket-Spring Mattress</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Complimentary High-Speed Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">24/7 Room Service & Housekeeping</span>
                </div>
              </div>
            </div>

            {/* Room Specifications Table */}
            <div>
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-3">
                Deluxe Specifications
              </h3>
              <div className="bg-white rounded-xl border border-brown-900/10 overflow-hidden text-xs sm:text-sm">
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10">
                  <span className="font-semibold text-brown-700">Bed Type</span>
                  <span className="text-brown-950">Pocket-Spring Spine Support Mattress</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10 bg-cream/30">
                  <span className="font-semibold text-brown-700">Maximum Occupancy</span>
                  <span className="text-brown-950">2 Adults + Extra Bed Support</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10">
                  <span className="font-semibold text-brown-700">Bathroom</span>
                  <span className="text-brown-950">En-suite Private Bathroom with Premium Fixtures</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10 bg-cream/30">
                  <span className="font-semibold text-brown-700">Air Conditioning</span>
                  <span className="text-brown-950">Silent Split AC with Temperature Controller</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10">
                  <span className="font-semibold text-brown-700">Extra Bed Option</span>
                  <span className="text-brown-950">Available at ₹600 / night</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 bg-cream/30">
                  <span className="font-semibold text-brown-700">Check-in / Check-out</span>
                  <span className="text-brown-950">12:00 PM Check-in / 11:00 AM Check-out</span>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="pt-4">
              <h3 className="font-serif text-xl font-bold text-brown-950 mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {ROOM_FAQS.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-5 rounded-xl bg-cream-soft border border-brown-900/10 space-y-1.5"
                  >
                    <h4 className="font-semibold text-sm text-brown-950">{faq.question}</h4>
                    <p className="text-xs sm:text-sm text-brown-800/90 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar CTA & Related Rooms */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Reservation Card */}
            <div className="bg-cream-soft border border-gold-400/30 rounded-2xl p-6 shadow-sm sticky top-24">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brown-700 font-bold block mb-1">
                Direct Hotel Booking
              </span>
              <h3 className="font-serif text-xl font-bold text-brown-950 mb-2">
                Reserve AC Deluxe Room
              </h3>
              <p className="text-xs text-brown-700 mb-4">
                Enjoy pocket-spring comfort, high-speed Wi-Fi, and 24-hour service.
              </p>

              <div className="p-4 bg-white rounded-xl border border-brown-900/10 mb-5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-brown-600">Single Occupancy:</span>
                  <span className="font-bold text-brown-950">₹{singlePrice.toLocaleString("en-IN")} / night</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-600">Double Occupancy:</span>
                  <span className="font-bold text-brown-950">₹{doublePrice.toLocaleString("en-IN")} / night</span>
                </div>
                <div className="flex justify-between text-[11px] text-brown-500 pt-1 border-t border-brown-900/5">
                  <span>Taxes:</span>
                  <span>5% GST applicable</span>
                </div>
              </div>

              <Link
                href="/booking?room=ac-deluxe"
                className="w-full py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center block shadow-sm transition-colors mb-3"
              >
                Proceed to Booking
              </Link>

              <a
                href={`tel:${HOTEL_INFO.telephone}`}
                className="w-full py-2.5 rounded-xl border border-brown-900/30 hover:bg-brown-900/5 text-brown-900 font-semibold text-xs text-center block transition-colors"
              >
                Call Front Desk: {HOTEL_INFO.telephone}
              </a>

              {/* Related Rooms */}
              <div className="mt-8 pt-6 border-t border-brown-900/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brown-900 mb-3">
                  Other Room Categories
                </h4>
                <div className="space-y-3">
                  <Link
                    href="/rooms/ac-executive"
                    className="p-3 rounded-xl bg-white border border-brown-900/10 hover:border-gold-400 block transition-colors"
                  >
                    <div className="font-semibold text-xs text-brown-950">AC Executive Room</div>
                    <div className="text-[11px] text-brown-600">For solo travelers & short trips</div>
                  </Link>
                  <Link
                    href="/rooms/royal-suite"
                    className="p-3 rounded-xl bg-white border border-brown-900/10 hover:border-gold-400 block transition-colors"
                  >
                    <div className="font-semibold text-xs text-brown-950">Royal Suite</div>
                    <div className="text-[11px] text-brown-600">Separate bedroom, lounge & 2 washrooms</div>
                  </Link>
                </div>
                <Link
                  href="/rooms"
                  className="mt-4 pt-3 border-t border-brown-900/10 text-xs font-semibold text-brown-800 hover:text-brown-950 inline-flex items-center gap-1.5 hover:underline"
                >
                  <ArrowRight className="h-3 w-3 text-gold-600" />
                  <span>View All Rooms Overview</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
