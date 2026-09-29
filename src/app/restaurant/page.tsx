import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO, generateRestaurantSchema } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  Phone,
  Mail,
  CalendarCheck,
  CheckCircle2,
  Coffee,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Takshshila Restaurant in Bhagalpur | Hotel Rajhans International",
  description:
    "Dine at Takshshila Restaurant at Hotel Rajhans International, Bhagalpur. Renowned for authentic North Indian, Chinese, Mughlai, and traditional Bihari cuisine at Kachari Chowk, MG Road.",
  alternates: {
    canonical: getCanonicalUrl("/restaurant"),
  },
  openGraph: {
    title: "Takshshila Restaurant in Bhagalpur | Hotel Rajhans International",
    description:
      "Celebrated multi-cuisine dining experience in Bhagalpur. North Indian, Mughlai, Chinese, and local Bihari specialties with 24/7 room service.",
    url: getCanonicalUrl("/restaurant"),
    type: "website",
    images: [
      {
        url: `${HOTEL_INFO.url}/images/restaurant/R001.jpg`,
        width: 1200,
        height: 800,
        alt: "Takshshila Restaurant Fine Dining Space Bhagalpur",
      },
    ],
  },
};

const RESTAURANT_IMAGES = [
  { src: "/images/restaurant/R001.jpg", alt: "Takshshila Restaurant Main Dining Hall Bhagalpur" },
  { src: "/images/restaurant/R002.jpg", alt: "Comfortable Seating and Ambient Lighting at Takshshila" },
  { src: "/images/restaurant/R003.jpg", alt: "Freshly Cooked Multi-Cuisine Presentation" },
  { src: "/images/restaurant/R004.jpg", alt: "Takshshila Restaurant Family Dining Area" },
];

export default async function RestaurantPage() {
  let menuCategories: any[] = [];
  try {
    menuCategories = await prisma.menuCategory.findMany({
      where: { isActive: true },
      include: { items: { where: { isAvailable: true } } },
      orderBy: { displayOrder: "asc" },
    });
  } catch (err) {
    console.error("Restaurant Menu Fetch Error:", err);
  }

  const restaurantSchema = generateRestaurantSchema();

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs items={[{ name: "Restaurant" }]} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Fine Dining & Culinary Excellence
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Takshshila Restaurant in Bhagalpur
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Welcome to Takshshila Restaurant, the premier dining destination inside Hotel Rajhans
            International. Offering authentic North Indian flavors, sizzling tandoori delicacies,
            Indo-Chinese specialties, and wholesome Bihari thalis in a relaxed family environment.
          </p>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
            <Image
              src={RESTAURANT_IMAGES[0].src}
              alt={RESTAURANT_IMAGES[0].alt}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            {RESTAURANT_IMAGES.slice(1, 3).map((img, idx) => (
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

      {/* Restaurant Overview & Experience */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                A Landmark of Hospitality & Flavors in Bhagalpur
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Operating under Takshshila Regency Pvt. Ltd., Takshshila Restaurant combines
                uncompromising hygiene with authentic Indian culinary traditions. Our chefs
                utilize fresh local produce, aromatic whole spices, and time-honored cooking
                techniques to bring forth rich gravies, soft breads straight from the clay tandoor,
                and crisp appetizers.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Whether you are staying at the hotel or visiting with family and associates for lunch
                or dinner, Takshshila offers an air-conditioned, gracious setting with prompt table
                service. For hotel guests, our complete menu is also available through 24-hour room service.
              </p>
            </div>

            {/* Cuisines Offered */}
            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Cuisines & Dining Specialties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-brown-900">
                <div className="space-y-1">
                  <h4 className="font-bold text-brown-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-gold-600" />
                    <span>North Indian & Tandoor</span>
                  </h4>
                  <p className="text-brown-700 text-xs pl-5">
                    Dal Makhani, Butter Naan, Paneer Butter Masala, aromatic Biryanis, and Kebabs.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-brown-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-gold-600" />
                    <span>Indo-Chinese Delights</span>
                  </h4>
                  <p className="text-brown-700 text-xs pl-5">
                    Chilli Paneer, Manchurian, Hakka Noodles, Fried Rice, and Sweet Corn Soups.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-brown-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-gold-600" />
                    <span>Traditional Regional Flavors</span>
                  </h4>
                  <p className="text-brown-700 text-xs pl-5">
                    Authentic Bihari thalis, seasonal vegetables, and regional lentil preparations.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-brown-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-gold-600" />
                    <span>Breakfast & Hot Beverages</span>
                  </h4>
                  <p className="text-brown-700 text-xs pl-5">
                    Special Masala Chai, freshly brewed coffee, stuffed parathas, toast, and eggs.
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Highlights (from DB if available) */}
            {menuCategories.length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-bold text-brown-950 mb-3">
                  Featured Menu Selections
                </h3>
                <div className="space-y-4">
                  {menuCategories.map((cat: any) => (
                    <div
                      key={cat.id}
                      className="p-5 rounded-xl bg-white border border-brown-900/10 space-y-3"
                    >
                      <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-brown-900 border-b border-brown-900/10 pb-2">
                        {cat.name}
                      </h4>
                      <div className="divide-y divide-brown-900/5">
                        {cat.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="py-2.5 flex items-center justify-between gap-4 text-xs sm:text-sm"
                          >
                            <div>
                              <div className="font-semibold text-brown-950">{item.name}</div>
                              {item.description && (
                                <div className="text-[11px] text-brown-600">{item.description}</div>
                              )}
                            </div>
                            <div className="font-mono font-bold text-brown-950 shrink-0">
                              ₹{item.price}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info & Table Reservation */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brown-700 font-bold block mb-1">
                Takshshila Dining
              </span>
              <h3 className="font-serif text-xl font-bold text-brown-950 mb-3">
                Hours & Information
              </h3>

              <div className="space-y-3 text-xs text-brown-800 mb-6 border-b border-brown-900/10 pb-4">
                <div className="flex justify-between">
                  <span className="text-brown-600">Breakfast:</span>
                  <span className="font-semibold">07:00 AM – 10:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-600">Lunch:</span>
                  <span className="font-semibold">12:30 PM – 03:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-600">Dinner:</span>
                  <span className="font-semibold">07:30 PM – 11:00 PM</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-brown-900/5 text-gold-900 font-semibold">
                  <span>Room Service:</span>
                  <span>24 Hours Continuous</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-xs text-brown-800">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-brown-600 shrink-0 mt-0.5" />
                  <span>Ground Floor, Hotel Rajhans International, Kachari Chowk, MG Road, Bhagalpur</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brown-600 shrink-0" />
                  <span>{HOTEL_INFO.telephone}</span>
                </div>
              </div>

              <a
                href={`tel:${HOTEL_INFO.telephone}`}
                className="w-full py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center block shadow-sm transition-colors mb-3"
              >
                Reserve Table / Order
              </a>

              <Link
                href="/services/room-service"
                className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-semibold text-xs text-center block transition-colors"
              >
                View 24/7 Room Service
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
