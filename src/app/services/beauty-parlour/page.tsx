import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  Sparkles,
  Scissors,
  Heart,
  Clock,
  CheckCircle2,
  Phone,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Camera,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Rajhans Ladies Beauty Parlour | Hotel Rajhans International Bhagalpur",
  description:
    "Hair, skincare, and beauty treatments without leaving the hotel. Rajhans Ladies Beauty Parlour offers bridal makeup, hair styling, facials, and grooming at Kachari Chowk, Bhagalpur.",
  alternates: {
    canonical: getCanonicalUrl("/services/beauty-parlour"),
  },
  openGraph: {
    title: "Rajhans Ladies Beauty Parlour | Hotel Rajhans International",
    description:
      "Exclusive ladies beauty parlour on-site at Hotel Rajhans International. Hair spa, facials, bridal packages, and skincare at Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/services/beauty-parlour"),
    type: "website",
  },
};

export default function BeautyParlourPage() {
  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-12 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[
                { name: "Services", url: "/services" },
                { name: "Beauty Parlour", url: "/services/beauty-parlour" },
              ]}
              currentUrl="/services/beauty-parlour"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
            Ladies Beauty & Wellness
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Rajhans Ladies Beauty Parlour
          </h1>
          <p className="text-xs sm:text-sm text-cream-soft/80 max-w-xl leading-relaxed">
            Hair, skincare, and beauty treatments without leaving the hotel. An exclusive sanctuary
            for ladies with professional beauticians and trusted cosmetic care.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {/* Primary Image */}
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/parlour/BP002.jpg"
                alt="Rajhans Ladies Beauty Parlour Reception and Services Desk"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Description */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Full-Service Beauty Care Under One Roof
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Whether you are staying at Hotel Rajhans International for an important business conference,
                attending a family wedding in Bhagalpur, or enjoying a leisurely vacation, our on-site
                <strong> Rajhans Ladies Beauty Parlour</strong> provides complete grooming and rejuvenation
                without the hassle of traveling through city traffic.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Step into a serene, hygienic, and strictly ladies-only environment staffed by seasoned
                cosmetologists. We use dermatologist-approved, branded skincare formulations and premium hair products
                to ensure you look and feel your absolute best.
              </p>
            </div>

            {/* Service Offerings */}
            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-600" />
                <span>Treatments & Beauty Packages</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-brown-900">
                <div className="p-4 rounded-xl bg-white/70 border border-brown-900/5 space-y-1">
                  <h4 className="font-bold text-brown-950 text-sm">Hair Styling & Hair Spa</h4>
                  <p className="text-xs text-brown-700 leading-relaxed">
                    Custom haircuts, precision trims, deep conditioning hair spa, blow-dry styling, and coloring.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/70 border border-brown-900/5 space-y-1">
                  <h4 className="font-bold text-brown-950 text-sm">Skincare & Rejuvenating Facials</h4>
                  <p className="text-xs text-brown-700 leading-relaxed">
                    Herbal cleanups, fruit facials, gold glow treatments, D-tan therapies, and gentle exfoliation.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/70 border border-brown-900/5 space-y-1">
                  <h4 className="font-bold text-brown-950 text-sm">Bridal & Party Makeovers</h4>
                  <p className="text-xs text-brown-700 leading-relaxed">
                    Pre-bridal packages, HD party makeup, elegant saree draping, and customized event looks.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/70 border border-brown-900/5 space-y-1">
                  <h4 className="font-bold text-brown-950 text-sm">Hands & Feet Care</h4>
                  <p className="text-xs text-brown-700 leading-relaxed">
                    Aroma manicures, soothing spa pedicures, nail shaping, polish, and cuticle care.
                  </p>
                </div>
              </div>
            </div>

            {/* Quality & Hygiene Highlights */}
            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Why Guests Choose Rajhans Beauty Parlour
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-brown-900">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Strictly Private Ladies-Only Floor</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Certified & Experienced Beauticians</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Sterilized Equipment & Fresh Towels</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Premium Branded Beauty Products</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Seamless In-Room Charge to Folio</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Appointments via Front Desk / Intercom</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 text-gold-600 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold">
                  Guest Parlour Info
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-2">
                Book a Beauty Session
              </h3>
              <p className="text-xs text-brown-700 mb-4 leading-relaxed">
                Walk-ins and advance reservations are warmly welcomed for hotel residents and visitors alike.
              </p>

              <div className="space-y-3 mb-6 text-xs text-brown-900 border-t border-b border-brown-900/10 py-4">
                <div className="flex justify-between">
                  <span className="text-brown-700">Operating Hours:</span>
                  <span className="font-bold">10:00 AM – 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-700">Location:</span>
                  <span className="font-bold">1st Floor, Hotel Premises</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-700">In-Room Phone:</span>
                  <span className="font-bold">Dial Reception / Intercom</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-700">Direct Helpline:</span>
                  <a href={`tel:${HOTEL_INFO.telephone}`} className="font-bold text-gold-600 hover:underline">
                    {HOTEL_INFO.telephone}
                  </a>
                </div>
              </div>

              <a
                href={`tel:${HOTEL_INFO.telephone}`}
                className="w-full py-2.5 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center block transition-colors mb-3"
              >
                Call to Book Appointment
              </a>

              <Link
                href="/gallery?category=parlour"
                className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors mb-2"
              >
                <Camera className="h-3.5 w-3.5 text-gold-600" />
                <span>View Parlour Photos</span>
              </Link>

              <Link
                href="/services"
                className="w-full py-2 rounded-xl text-brown-800 hover:text-brown-950 text-xs font-semibold text-center block hover:underline"
              >
                ← Back to All Services
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
