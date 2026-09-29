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
  Refrigerator,
  Sofa,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Royal Suite in Bhagalpur | Hotel Rajhans International",
  description:
    "Experience the Royal Suite at Hotel Rajhans International, Bhagalpur. Features a private bedroom, separate living room, two bathrooms, mini-fridge, sofa seating, and 24/7 room service.",
  alternates: {
    canonical: getCanonicalUrl("/rooms/royal-suite"),
  },
  openGraph: {
    title: "Royal Suite in Bhagalpur | Hotel Rajhans International",
    description:
      "Exclusive suite with separate master bedroom, private living lounge, double washrooms, and mini-fridge at Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/rooms/royal-suite"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/suite/SR001.jpg`,
        width: 1200,
        height: 800,
        alt: "Royal Suite Living Room and Master Bedroom Bhagalpur",
      },
    ],
  },
};

const SUITE_GALLERY = [
  { src: "/images/suite/SR001.jpg", alt: "Royal Suite Master Bedroom and Plush Bedding Bhagalpur" },
  { src: "/images/suite/SR002.jpg", alt: "Royal Suite Furnished Living Lounge and Sofa Seating" },
  { src: "/images/suite/SR003.jpg", alt: "Royal Suite Executive Workstation and Mini Fridge" },
  { src: "/images/suite/SR004.jpg", alt: "Royal Suite Double Washroom and Fixtures" },
];

const SUITE_FAQS = [
  {
    question: "What makes the Royal Suite special at Hotel Rajhans International?",
    answer:
      "The Royal Suite provides a dual-room configuration comprising a private master bedroom, an independent living room with sofa seating, two full washrooms, a mini-refrigerator, and personalized room service.",
  },
  {
    question: "What is the tariff for the Royal Suite?",
    answer:
      "The Royal Suite is priced at ₹5,190 per night before taxes. This comprehensive rate includes access to the private living room, bedroom, dual washrooms, and complimentary high-speed Wi-Fi.",
  },
  {
    question: "How many guests can stay in the Royal Suite?",
    answer:
      "The suite comfortably accommodates up to 4 guests (2 adults in the king bedroom, with sofa or extra rollaway bed options for additional guests or children).",
  },
  {
    question: "Does the Royal Suite have two washrooms?",
    answer:
      "Yes, the Royal Suite features two independent en-suite washrooms, ensuring complete privacy and comfort for visiting guests and families.",
  },
];

export default async function RoyalSuitePage() {
  let dbRoom: any = null;
  try {
    dbRoom = await prisma.room.findFirst({
      where: { type: "ROYAL_SUITE" },
      include: { amenities: true },
    });
  } catch (err) {
    console.error("DB Suite Fetch Error:", err);
  }

  const suitePrice = dbRoom?.basePriceSingle ?? 5190;
  const amenitiesList =
    dbRoom?.amenities?.map((a: any) => a.amenityName) || [
      "Bedroom + Living Room",
      "Double Washroom",
      "Mini Fridge",
      "Study Table",
      "Sofa Seating Area",
      "Fruit Basket",
      "A/C",
    ];

  const roomSchema = generateRoomSchema({
    name: "Royal Suite",
    description:
      "Exclusive suite with separate master bedroom, private living lounge, double washrooms, and mini-fridge at Hotel Rajhans International, Bhagalpur.",
    url: "/rooms/royal-suite",
    image: "/images/suite/SR001.jpg",
    priceSingle: suitePrice,
    priceDouble: suitePrice,
    occupancy: 4,
    bedType: "King Bed + Living Area",
    amenities: amenitiesList,
  });

  const faqSchema = generateFaqSchema(SUITE_FAQS);

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
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs
              items={[
                { name: "Rooms & Suites", url: "/rooms" },
                { name: "Royal Suite" },
              ]}
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
                Premier Hospitality & Space
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Royal Suite in Bhagalpur
              </h1>
              <p className="text-xs sm:text-sm text-cream-soft/80 mt-2 max-w-xl">
                Dual-room sanctuary featuring private master bedroom, living lounge, and double washrooms.
              </p>
            </div>

            <div className="bg-cream/10 border border-gold-400/30 rounded-2xl p-4 backdrop-blur-md flex items-center gap-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-gold-300 block">
                  Suite Tariff (Excl. Tax)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    ₹{suitePrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-cream-soft">/ Suite per night</span>
                </div>
                <div className="text-[11px] text-gold-300/80 font-mono">
                  Up to 4 Guests • 2 Washrooms
                </div>
              </div>

              <Link
                href="/booking?room=royal-suite"
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-brown-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>Book Suite</span>
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
              src={SUITE_GALLERY[0].src}
              alt={SUITE_GALLERY[0].alt}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            {SUITE_GALLERY.slice(1, 3).map((img, idx) => (
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

      {/* Suite Details & Content */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Description */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Grandeur, Privacy & Distinct Living Quarters
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                The Royal Suite represents the crowning accommodation at Hotel Rajhans International.
                Thoughtfully configured with an independent master bedroom separated from an expansive
                living salon, the suite accommodates family holidays, bridal parties, and VIP travelers
                who require distinguished privacy.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Entertain visiting colleagues in the spacious sofa seating lounge without compromising
                the intimacy of your private bedroom. With two dedicated washrooms, an in-room mini-fridge,
                individual air conditioning units in each space, and priority room service, the Royal
                Suite delivers residential luxury with hotel convenience.
              </p>
            </div>

            {/* Key Amenities */}
            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Royal Suite Exclusive Features
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
                  <span className="font-medium">Two Independent Attached Washrooms</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">In-Room Mini Refrigerator</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Complimentary High-Speed Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Priority 24/7 Dining from Takshshila</span>
                </div>
              </div>
            </div>

            {/* Room Specifications Table */}
            <div>
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-3">
                Suite Specifications
              </h3>
              <div className="bg-white rounded-xl border border-brown-900/10 overflow-hidden text-xs sm:text-sm">
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10">
                  <span className="font-semibold text-brown-700">Layout</span>
                  <span className="text-brown-950">1 Master Bedroom + 1 Independent Living Room</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10 bg-cream/30">
                  <span className="font-semibold text-brown-700">Bathrooms</span>
                  <span className="text-brown-950 font-bold text-gold-800">2 Full En-suite Washrooms</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10">
                  <span className="font-semibold text-brown-700">Occupancy</span>
                  <span className="text-brown-950">Up to 4 Guests</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10 bg-cream/30">
                  <span className="font-semibold text-brown-700">Refrigeration</span>
                  <span className="text-brown-950">In-Room Mini Fridge / Chiller</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 border-b border-brown-900/10">
                  <span className="font-semibold text-brown-700">Living Lounge</span>
                  <span className="text-brown-950">Plush Sofa Set & Center Table</span>
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
                {SUITE_FAQS.map((faq, fIdx) => (
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
                Reserve Royal Suite
              </h3>
              <p className="text-xs text-brown-700 mb-4">
                Experience the pinnacle of space and comfort in Bhagalpur.
              </p>

              <div className="p-4 bg-white rounded-xl border border-brown-900/10 mb-5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-brown-600">Suite Rate:</span>
                  <span className="font-bold text-brown-950">₹{suitePrice.toLocaleString("en-IN")} / night</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-600">Occupancy:</span>
                  <span className="font-bold text-brown-950">Up to 4 Guests</span>
                </div>
                <div className="flex justify-between text-[11px] text-brown-500 pt-1 border-t border-brown-900/5">
                  <span>Taxes:</span>
                  <span>5% GST applicable</span>
                </div>
              </div>

              <Link
                href="/booking?room=royal-suite"
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
                    <div className="text-[11px] text-brown-600">Starting from ₹3,790 / night</div>
                  </Link>
                  <Link
                    href="/rooms/ac-deluxe"
                    className="p-3 rounded-xl bg-white border border-brown-900/10 hover:border-gold-400 block transition-colors"
                  >
                    <div className="font-semibold text-xs text-brown-950">AC Deluxe Room</div>
                    <div className="text-[11px] text-brown-600">Pocket-spring comfort from ₹3,790 / night</div>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
