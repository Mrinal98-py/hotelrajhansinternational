import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms and Conditions | Hotel Rajhans International Bhagalpur",
  description:
    "Official Terms and Conditions governing room reservations, stay regulations, check-in requirements, and guest conduct at Hotel Rajhans International (Takshshila Regency Pvt. Ltd.).",
  alternates: {
    canonical: getCanonicalUrl("/terms-and-conditions"),
  },
  openGraph: {
    title: "Terms and Conditions | Hotel Rajhans International",
    description:
      "General terms and conditions for bookings and guest stays at Hotel Rajhans International, Bhagalpur.",
    url: getCanonicalUrl("/terms-and-conditions"),
    type: "website",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[{ name: "Terms and Conditions", url: "/terms-and-conditions" }]}
              currentUrl="/terms-and-conditions"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Stay Guidelines
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Terms and Conditions
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Please review these terms and conditions before confirming your reservation at Hotel Rajhans
            International, operated by Takshshila Regency Pvt. Ltd.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="bg-cream-soft rounded-3xl border border-brown-900/10 p-6 sm:p-10 space-y-8 text-brown-900 leading-relaxed text-xs sm:text-sm shadow-xs">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              1. Check-in and Identification Regulations
            </h2>
            <p className="text-brown-800/90 mb-3">
              Standard check-in time is <strong>12:00 PM (Noon)</strong> and standard check-out time
              is <strong>11:00 AM</strong>. Early check-in or late check-out is subject to physical
              room inventory availability and may incur supplemental hourly or half-day charges.
            </p>
            <p className="text-brown-800/90">
              Pursuant to Government of India regulations, every adult guest must furnish a valid
              original government-issued photo identity proof (Aadhaar Card, Passport, Driving License,
              or Voter ID Card) at reception. PAN cards are not accepted as valid identity/address proof.
              Foreign nationals must present a valid passport and Indian visa (or OCI card).
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              2. Room Occupancy & Extra Bedding
            </h2>
            <p className="text-brown-800/90 mb-3">
              Maximum allowable occupancy per standard room (AC Executive and AC Deluxe) is 2 adults
              plus 1 child under 6 years of age sharing existing bedding. Royal Suites accommodate
              up to 4 guests.
            </p>
            <p className="text-brown-800/90">
              Requests for an additional rollaway mattress are subject to room category feasibility
              and applicable extra bed charges.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              3. Guest Conduct & Property Care
            </h2>
            <p className="text-brown-800/90 mb-3">
              Guests are expected to conduct themselves with consideration towards other hotel patrons.
              Any intentional damage, defacement, or breakage of hotel fixtures, electronics, or
              linens will be assessed and billed directly to the guest&apos;s master folio upon departure.
            </p>
            <p className="text-brown-800/90">
              Smoking is strictly prohibited inside designated non-smoking guest rooms and enclosed
              public corridors. Designated outdoor smoking zones are available.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              4. Tariff, Taxes & Billing
            </h2>
            <p className="text-brown-800/90 mb-3">
              Room rates are quoted exclusive of statutory Goods and Services Tax (GST) unless
              explicitly stated. Takshshila Regency Pvt. Ltd. (GSTIN: 10AAAAA0000A1Z5) issues
              official tax invoices for all room charges, restaurant orders, and laundry services.
            </p>
            <p className="text-brown-800/90">
              Complete settlement of all outstanding folio charges is required prior to departure.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              5. Governing Law & Jurisdiction
            </h2>
            <p className="text-brown-800/90">
              These terms, reservations, and all guest interactions are governed by and construed in
              accordance with the laws of India. Any legal dispute, claim, or controversy arising out
              of or in connection with a stay at Hotel Rajhans International shall be subject to the
              exclusive territorial jurisdiction of the competent courts in <strong>Bhagalpur, Bihar</strong>.
            </p>
          </div>

          <div className="pt-6 border-t border-brown-900/10 text-xs text-brown-800">
            <p className="font-semibold text-brown-950 mb-1">Corporate Details:</p>
            <p>Takshshila Regency Pvt. Ltd. • Hotel Rajhans International</p>
            <p>Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001, India</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
