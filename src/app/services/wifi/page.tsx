import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import {
  Wifi,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  CalendarCheck,
  Phone,
  Signal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "High-Speed Wi-Fi Internet in Bhagalpur | Hotel Rajhans International",
  description:
    "Complimentary enterprise high-speed Wi-Fi across all guest rooms, lobby, and dining areas at Hotel Rajhans International, Bhagalpur. Reliable fiber broadband for remote work and streaming.",
  alternates: {
    canonical: getCanonicalUrl("/services/wifi"),
  },
  openGraph: {
    title: "High-Speed Wi-Fi Internet | Hotel Rajhans International",
    description:
      "Complimentary high-speed fiber internet for hotel guests at Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/services/wifi"),
    type: "website",
  },
};

export default function WifiServicePage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-12 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[
                { name: "Services", url: "/services" },
                { name: "High-Speed Wi-Fi", url: "/services/wifi" },
              ]}
              currentUrl="/services/wifi"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-1">
            Seamless Connectivity
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            High-Speed Wi-Fi Internet in Bhagalpur
          </h1>
          <p className="text-xs sm:text-sm text-cream-soft/80 max-w-xl">
            Enterprise fiber internet available 24/7 with seamless coverage across all rooms and common spaces.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/executive/Room-002.jpg"
                alt="High-Speed Wi-Fi Workstation in Hotel Rajhans International Rooms"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-950 mb-3">
                Work, Stream & Connect Without Interruption
              </h2>
              <p className="text-sm text-brown-800/90 leading-relaxed mb-4">
                In today&apos;s hyper-connected world, high-speed and reliable internet is as essential
                as a restful bed. Hotel Rajhans International provides complimentary dedicated
                fiber-optic Wi-Fi throughout the entire property, ensuring business delegates, tourists,
                and digital nomads stay reliably connected.
              </p>
              <p className="text-sm text-brown-800/90 leading-relaxed">
                Whether you need to conduct uninterrupted Zoom or Teams video conferences from your
                executive study desk, stream high-definition movies, or securely access corporate VPNs,
                our multi-access-point network delivers stable bandwidth and enterprise encryption.
              </p>
            </div>

            <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-4">
                Wi-Fi Network Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-brown-900">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">100% Free for All In-House Guests</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">High Bandwidth Fiber Backhaul</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Seamless Roaming Across Floors</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Low-Latency for Video Conferences</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">Coverage in All 33 Rooms & Suites</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold-600 shrink-0" />
                  <span className="font-medium">24/7 Front Desk Tech Assistance</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-brown-900/15 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-bold text-brown-950 mb-2">
                Stay Productive in Bhagalpur
              </h3>
              <p className="text-xs text-brown-700 mb-4 leading-relaxed">
                Connect your laptops, tablets, and phones on arrival with instant front desk access credentials.
              </p>

              <Link
                href="/booking"
                className="w-full py-2.5 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center block transition-colors mb-3"
              >
                Book Your Stay
              </Link>
              <Link
                href="/rooms"
                className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center block transition-colors mb-2"
              >
                View Rooms with Study Desk
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
