import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import {
  Tag,
  Percent,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Gift,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Special Offers & Hotel Deals in Bhagalpur | Hotel Rajhans International",
  description:
    "Discover active room discounts and exclusive promotional deals at Hotel Rajhans International, Bhagalpur. Book direct for lowest rates, promo codes, and special seasonal savings.",
  alternates: {
    canonical: getCanonicalUrl("/offers"),
  },
  openGraph: {
    title: "Special Offers & Deals | Hotel Rajhans International Bhagalpur",
    description:
      "Exclusive direct booking discounts, promo codes, and packages for AC Executive, AC Deluxe, and Royal Suites in Bhagalpur.",
    url: getCanonicalUrl("/offers"),
    type: "website",
  },
};

export default async function OffersPage() {
  const now = new Date();
  let activePromos: any[] = [];

  try {
    activePromos = await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Promotions Fetch Error:", err);
  }

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs items={[{ name: "Special Offers" }]} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Direct Booking Advantages
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Special Offers & Seasonal Deals
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Take advantage of exclusive direct booking promotions, seasonal discounts, and value-added
            packages for your stay at Hotel Rajhans International, Bhagalpur.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        {/* Active Promotions Grid */}
        <div className="mb-14">
          <h2 className="font-serif text-2xl font-bold text-brown-950 mb-6">
            Active Promotional Coupons
          </h2>

          {activePromos.length === 0 ? (
            <div className="p-8 rounded-2xl bg-cream-soft border border-brown-900/10 text-center text-xs text-brown-700">
              No active coupon codes at this moment. You always receive our guaranteed direct booking rate online!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePromos.map((promo) => (
                <article
                  key={promo.id}
                  className="bg-cream-soft rounded-2xl border border-brown-900/15 overflow-hidden shadow-xs hover:shadow-md transition-shadow p-6 sm:p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/20 text-gold-900 text-xs font-mono font-bold uppercase tracking-wider border border-gold-400/30">
                        <Tag className="h-3.5 w-3.5" />
                        <span>Code: {promo.code}</span>
                      </div>
                      <span className="font-serif text-xl font-bold text-brown-950">
                        {promo.discountType === "PERCENTAGE"
                          ? `${promo.discountValue}% OFF`
                          : `₹${promo.discountValue} OFF`}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-brown-950 mb-2">
                      {promo.description || `Special ${promo.code} Discount`}
                    </h3>

                    <div className="space-y-1.5 text-xs text-brown-700 mb-6">
                      {promo.minSpend > 0 && (
                        <p>• Applicable on minimum booking value of ₹{promo.minSpend.toLocaleString("en-IN")}</p>
                      )}
                      {promo.validUntil && (
                        <p className="flex items-center gap-1 text-brown-600 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            Valid through{" "}
                            {new Date(promo.validUntil).toLocaleDateString("en-IN", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brown-900/10 flex items-center justify-between gap-4">
                    <span className="text-[11px] text-brown-500 font-mono">
                      Apply during online checkout
                    </span>
                    <Link
                      href={`/booking?coupon=${promo.code}`}
                      className="px-5 py-2 text-xs font-bold bg-brown-900 hover:bg-brown-800 text-cream rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <CalendarCheck className="h-3.5 w-3.5 text-gold-400" />
                      <span>Book with Code</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Guaranteed Direct Perks */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-brown-950 mb-2">
            Why Book Directly On Our Website?
          </h2>
          <p className="text-xs sm:text-sm text-brown-700 mb-8 max-w-xl">
            Booking directly ensures you avoid third-party agency markups and receive priority consideration.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
              <ShieldCheck className="h-6 w-6 text-gold-700" />
              <h3 className="font-bold text-sm text-brown-950">Best Rate Guarantee</h3>
              <p className="text-xs text-brown-700 leading-relaxed">
                Direct online reservations feature the lowest official rates with no extra OTA convenience fees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
              <Clock className="h-6 w-6 text-gold-700" />
              <h3 className="font-bold text-sm text-brown-950">Priority Early Check-in</h3>
              <p className="text-xs text-brown-700 leading-relaxed">
                Direct website guests receive first consideration for early arrivals and late departures based on availability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2">
              <Gift className="h-6 w-6 text-gold-700" />
              <h3 className="font-bold text-sm text-brown-950">Welcome Fruit Basket</h3>
              <p className="text-xs text-brown-700 leading-relaxed">
                All confirmed room reservations include a complimentary fresh fruit basket waiting in your room on arrival.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
