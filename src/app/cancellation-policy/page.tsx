import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Clock, AlertCircle, Phone, Mail, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Hotel Rajhans International Bhagalpur",
  description:
    "Official Cancellation and Refund Policy of Hotel Rajhans International, Bhagalpur. Standard 24-hour flexible cancellation, refund timelines, and check-in procedures.",
  alternates: {
    canonical: getCanonicalUrl("/cancellation-policy"),
  },
  openGraph: {
    title: "Cancellation & Refund Policy | Hotel Rajhans International",
    description:
      "Clear, transparent cancellation terms and refund timelines for direct reservations at Hotel Rajhans International.",
    url: getCanonicalUrl("/cancellation-policy"),
    type: "website",
  },
};

export default async function CancellationPolicyPage() {
  let policies: any[] = [];
  try {
    policies = await prisma.cancellationPolicy.findMany({
      where: { isActive: true },
      orderBy: { hoursBeforeCheckIn: "desc" },
    });
  } catch (err) {
    console.error("Cancellation Policy Fetch Error:", err);
  }

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs items={[{ name: "Cancellation Policy" }]} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Transparent Booking Terms
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Cancellation & Refund Policy
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Takshshila Regency Pvt. Ltd. (operating Hotel Rajhans International) maintains a transparent,
            fair cancellation framework for all direct hotel reservations.
          </p>
        </div>
      </section>

      {/* Main Policy Content */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="bg-cream-soft rounded-3xl border border-brown-900/10 p-6 sm:p-10 space-y-8 text-brown-900 leading-relaxed text-xs sm:text-sm shadow-xs">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              1. Standard Reservation Cancellation
            </h2>
            <p className="text-brown-800/90 mb-4">
              We understand that travel plans can change unexpectedly. For all standard direct bookings
              made via our official website or front desk:
            </p>
            <div className="p-4 rounded-2xl bg-white border border-brown-900/10 space-y-2">
              <div className="flex items-center gap-2 font-bold text-brown-950">
                <Clock className="h-4 w-4 text-gold-700" />
                <span>24-Hour Notice Window:</span>
              </div>
              <p className="text-brown-700">
                Cancellations requested at least <strong>24 hours prior</strong> to the scheduled
                check-in time (12:00 PM of the check-in date) are eligible for a <strong>100% refund</strong> of
                the room tariff paid, subject to nominal payment gateway transaction processing fees.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              2. Late Cancellations & No-Shows
            </h2>
            <p className="text-brown-800/90 mb-3">
              Cancellations initiated within 24 hours of the check-in time, or failure to arrive on
              the scheduled reservation date (&ldquo;No-Show&rdquo;), will incur a retention charge
              equivalent to <strong>one night&apos;s room tariff plus applicable taxes</strong>.
            </p>
            <p className="text-brown-800/90">
              For multi-night reservations, the remainder of the reservation will be released for
              re-booking unless written confirmation is received by the hotel front desk.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              3. Refund Processing Timelines
            </h2>
            <p className="text-brown-800/90 mb-3">
              Approved refunds are credited directly back to the original source account (UPI, Debit
              Card, Credit Card, or Net Banking) utilized during the Cashfree payment transaction.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-brown-800/90">
              <li>UPI Refunds: 24 to 48 hours</li>
              <li>Net Banking & Debit Cards: 3 to 5 business days</li>
              <li>Credit Cards: 5 to 7 business days (depending on your issuing bank&apos;s billing cycle)</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              4. Modifications & Rescheduling
            </h2>
            <p className="text-brown-800/90">
              Guests may request date modifications up to 24 hours prior to arrival, subject to
              room availability and applicable rate differences for the revised dates. Please contact
              our reservations desk directly.
            </p>
          </div>

          <div className="pt-6 border-t border-brown-900/10">
            <h3 className="font-serif text-base font-bold text-brown-950 mb-2">
              Cancellation Assistance Contact
            </h3>
            <p className="text-brown-700">
              To request an official cancellation or inquire about an ongoing refund, contact our
              front desk team with your Booking Reference number:
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-brown-950">
              <span>Telephone: +91 93081 89201</span>
              <span>•</span>
              <span>Email: info@hotelrajhansinternational.com</span>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
