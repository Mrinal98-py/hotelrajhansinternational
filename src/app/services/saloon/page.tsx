import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  Scissors,
  Sparkles,
  Clock,
  CheckCircle2,
  Phone,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Camera,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Rajhans Grooming Saloon | Hotel Rajhans International Bhagalpur",
  description:
    "Haircuts and grooming for men, open to hotel guests. Rajhans Grooming Saloon offers precision hair styling, beard grooming, head massage, and face care at Kachari Chowk, Bhagalpur.",
  alternates: {
    canonical: getCanonicalUrl("/services/saloon"),
  },
  openGraph: {
    title: "Rajhans Grooming Saloon | Hotel Rajhans International",
    description:
      "Men's grooming and hair styling salon on-site at Hotel Rajhans International. Haircuts, beard trims, and head massage at Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/services/saloon"),
    type: "website",
  },
};

export default function SaloonServicePage() {
  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-12 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[
                { name: "Services", url: "/services" },
                { name: "Grooming Saloon", url: "/services/saloon" },
              ]}
              currentUrl="/services/saloon"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
            Men&apos;s Styling & Grooming
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Rajhans Grooming Saloon
          </h1>
          <p className="text-xs sm:text-sm text-cream-soft/80 max-w-xl leading-relaxed">
            Haircuts and grooming for men, open to hotel guests. Fast, professional styling,
            beard grooming, and relaxing head massages right on hotel premises.
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
                src="/images/parlour/BP010.jpg"
                alt="Rajhans Grooming Saloon Styling Stations and Chairs"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Description */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Effortless Grooming for Busy Professionals & Travelers
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                Looking sharp for your morning business presentation or family celebration is effortless
                at Hotel Rajhans International. The on-site <strong>Rajhans Grooming Saloon</strong> provides
                modern haircutting, beard sculpturing, and traditional grooming services tailored for gentlemen.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Skip the inconvenience of searching for barber shops in unfamiliar city streets. Our salon
                features ergonomic barber styling chairs, sanitized equipment, premium hair care tonics, and
                experienced male stylists dedicated to delivering crisp, tailored results.
              </p>
            </div>

            {/* Service Offerings */}
            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-gold-600" />
                <span>Saloon Services & Treatments</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-brown-900">
                <div className="p-4 rounded-xl bg-white/70 border border-brown-900/5 space-y-1">
                  <h4 className="font-bold text-brown-950 text-sm">Men&apos;s Haircuts & Styling</h4>
                  <p className="text-xs text-brown-700 leading-relaxed">
                    Classic executive cuts, fades, trims, hair shampooing, and professional pomade/wax styling.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/70 border border-brown-900/5 space-y-1">
                  <h4 className="font-bold text-brown-950 text-sm">Beard Trimming & Styling</h4>
                  <p className="text-xs text-brown-700 leading-relaxed">
                    Precision line-ups, beard reshaping, hot towel treatments, and soothing aftershave care.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/70 border border-brown-900/5 space-y-1">
                  <h4 className="font-bold text-brown-950 text-sm">Revitalizing Head Massage</h4>
                  <p className="text-xs text-brown-700 leading-relaxed">
                    Traditional acupressure scalp massage with cooling herbal and Ayurvedic oils to release stress.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/70 border border-brown-900/5 space-y-1">
                  <h4 className="font-bold text-brown-950 text-sm">Face Cleanup & D-Tan</h4>
                  <p className="text-xs text-brown-700 leading-relaxed">
                    Deep-pore facial cleansing, exfoliation scrub, and tan removal for refreshed, energized skin.
                  </p>
                </div>
              </div>
            </div>

            {/* Quality & Hygiene Highlights */}
            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Saloon Quality & Convenience Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-brown-900">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Direct In-Hotel Access on 1st Floor</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">100% Sanitized & Single-Use Blades</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Skilled Barber & Styling Craftsmen</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Quick Turnaround for Corporate Guests</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Charge Directly to Your Hotel Folio</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Intercom / Front Desk Scheduling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 text-gold-600 mb-2">
                <Scissors className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold">
                  Saloon Quick Info
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-2">
                Walk In or Book Ahead
              </h3>
              <p className="text-xs text-brown-700 mb-4 leading-relaxed">
                Open daily for all hotel residents and walk-in visitors. Express service available for travelers.
              </p>

              <div className="space-y-3 mb-6 text-xs text-brown-900 border-t border-b border-brown-900/10 py-4">
                <div className="flex justify-between">
                  <span className="text-brown-700">Operating Hours:</span>
                  <span className="font-bold">9:00 AM – 8:30 PM</span>
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
                <span>View Saloon Photos</span>
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
