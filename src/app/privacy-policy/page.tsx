import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy | Hotel Rajhans International Bhagalpur",
  description:
    "Official Privacy Policy of Hotel Rajhans International (Takshshila Regency Pvt. Ltd.). Information regarding guest data collection, KYC compliance, payment security, and data protection.",
  alternates: {
    canonical: getCanonicalUrl("/privacy-policy"),
  },
  openGraph: {
    title: "Privacy Policy | Hotel Rajhans International Bhagalpur",
    description:
      "Understand how Hotel Rajhans International protects and processes guest personal data, KYC information, and payment transactions.",
    url: getCanonicalUrl("/privacy-policy"),
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[{ name: "Privacy Policy", url: "/privacy-policy" }]}
              currentUrl="/privacy-policy"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Data Protection & Trust
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Takshshila Regency Pvt. Ltd. is committed to maintaining the confidentiality and integrity
            of your personal and transactional information.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="bg-cream-soft rounded-3xl border border-brown-900/10 p-6 sm:p-10 space-y-8 text-brown-900 leading-relaxed text-xs sm:text-sm shadow-xs">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              1. Information We Collect
            </h2>
            <p className="text-brown-800/90 mb-3">
              When reserving a room, dining at Takshshila Restaurant, or inquiring about our services,
              we collect necessary information to process your reservation and comply with statutory laws:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-brown-800/90">
              <li>Contact Details: Full legal name, email address, and mobile phone number.</li>
              <li>Booking Details: Room preferences, check-in/check-out dates, and guest numbers.</li>
              <li>
                Statutory KYC Identification: Government-issued photo identification (Aadhaar, Passport,
                Voter ID, or Driving License) required during check-in under Indian hospitality regulations.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              2. Payment Data Security
            </h2>
            <p className="text-brown-800/90 mb-3">
              All electronic payments (UPI, Credit/Debit Cards, Net Banking) conducted through our
              website are processed directly by <strong>Cashfree Payments India Pvt. Ltd.</strong>, a
              licensed PCI-DSS Level 1 compliant payment aggregator.
            </p>
            <p className="text-brown-800/90">
              Hotel Rajhans International does not record, access, or store your sensitive payment
              credentials (card numbers, CVV, or net banking passwords) on our servers.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              3. Use of Information
            </h2>
            <p className="text-brown-800/90 mb-3">
              Your information is exclusively utilized for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-brown-800/90">
              <li>Confirming reservations and issuing official GST tax invoices.</li>
              <li>Sending reservation updates, receipts, and check-in instructions.</li>
              <li>Fulfilling local law enforcement registration mandates (e-Form C for foreign guests).</li>
              <li>Addressing customer inquiries and improving guest satisfaction.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              4. Third-Party Disclosures
            </h2>
            <p className="text-brown-800/90">
              We never sell, rent, or lease guest information to third-party marketing companies.
              Information is only disclosed to authorized law enforcement agencies when legally
              required under statutory judicial or regulatory mandates.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 mb-3">
              5. Contact Us Regarding Your Data
            </h2>
            <p className="text-brown-800/90">
              If you have any questions regarding your personal information, please write to our
              privacy grievance officer:
            </p>
            <div className="mt-3 text-xs font-semibold text-brown-950">
              <p>Takshshila Regency Pvt. Ltd.</p>
              <p>Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001, India</p>
              <p>Email: info@hotelrajhansinternational.com</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
