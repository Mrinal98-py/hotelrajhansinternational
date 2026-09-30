import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCanonicalUrl, HOTEL_INFO, generateFaqSchema } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import {
  HelpCircle,
  CalendarCheck,
  Phone,
  Bed,
  CreditCard,
  MapPin,
  UtensilsCrossed,
  Clock,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | Hotel Rajhans International Bhagalpur",
  description:
    "Find answers to frequently asked questions about booking, check-in, check-out, room rates, cancellation policies, dining at Takshshila Restaurant, and parking at Hotel Rajhans International, Bhagalpur.",
  alternates: {
    canonical: getCanonicalUrl("/faq"),
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | Hotel Rajhans International",
    description:
      "All your questions answered regarding stays, amenities, payments, policies, and dining in Bhagalpur.",
    url: getCanonicalUrl("/faq"),
    type: "website",
  },
};

const CATEGORIZED_FAQS = [
  {
    category: "Booking & Reservations",
    items: [
      {
        question: "How can I book a room at Hotel Rajhans International?",
        answer:
          "You can book directly through our official website by clicking 'Book Now', or by contacting our 24/7 front desk at +91 93081 89201. Direct website bookings guarantee the lowest published tariff and zero convenience charges.",
      },
      {
        question: "Do I receive instant confirmation for online bookings?",
        answer:
          "Yes. Upon successful online booking and payment verification through Cashfree, you immediately receive a booking reference ID and confirmed invoice details via screen and email.",
      },
    ],
  },
  {
    category: "Rooms & Accommodation",
    items: [
      {
        question: "What room types are available at the hotel?",
        answer:
          "We offer three dedicated categories across 33 physical rooms: AC Executive Room (ideal for business and solo travelers), AC Deluxe Room (featuring orthopedic pocket-spring beds and extra space), and the Royal Suite (comprising a master bedroom, private living lounge, and two washrooms).",
      },
      {
        question: "Can an extra bed be provided in the room?",
        answer:
          "Yes. Extra rollaway beds with fresh linens and toiletries can be accommodated in AC Deluxe and Royal Suite rooms at ₹500 - ₹600 per night (plus applicable taxes).",
      },
    ],
  },
  {
    category: "Check-in & Check-out",
    items: [
      {
        question: "What are the standard check-in and check-out timings?",
        answer:
          "Standard check-in time is 12:00 PM (noon) and standard check-out time is 11:00 AM. Early check-in or late check-out is subject to room availability upon request at the front desk.",
      },
      {
        question: "What government identity proof is mandatory for check-in?",
        answer:
          "All adult guests are required by law to present a valid government-issued photo ID (Aadhaar Card, Passport, Voter ID, or Driving License) during registration. PAN cards are not accepted as address proof.",
      },
    ],
  },
  {
    category: "Payment & Billing",
    items: [
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept all major UPI applications (Google Pay, PhonePe, Paytm), Credit and Debit Cards (Visa, MasterCard, RuPay), Net Banking, and Cash at the front desk. Online payments are secured by Cashfree Payment Gateway.",
      },
      {
        question: "Are taxes included in the room tariff?",
        answer:
          "Room rates are quoted before taxes. GST of 5% is applicable as per Government of India hotel hospitality tax slabs.",
      },
    ],
  },
  {
    category: "Cancellation & Refunds",
    items: [
      {
        question: "What is your cancellation and refund policy?",
        answer:
          "Cancellations made 24 hours prior to the standard check-in time are eligible for a full refund minus nominal payment gateway processing charges. Late cancellations or no-shows incur a one-night retention charge. Detailed guidelines are outlined on our Cancellation Policy page.",
      },
    ],
  },
  {
    category: "Location & Transport",
    items: [
      {
        question: "Where is Hotel Rajhans International located?",
        answer:
          "The hotel is centrally located at Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001, within walking distance of district courts, commercial centers, and banks.",
      },
      {
        question: "How far is the hotel from Bhagalpur Junction (BGP) Railway Station?",
        answer:
          "The hotel is located approximately 2.1 km from Bhagalpur Junction (a 7 to 10 minute drive). Pre-arranged station pickup and drop can be scheduled with our front desk at ₹350 per trip.",
      },
      {
        question: "Is car parking available on the premises?",
        answer:
          "Yes. We offer free on-site monitored private parking monitored by 24/7 security cameras for all staying guests.",
      },
    ],
  },
  {
    category: "Restaurant & Dining",
    items: [
      {
        question: "What dining options are available on-site?",
        answer:
          "Our in-house Takshshila Restaurant serves authentic North Indian, Mughlai, Chinese, and regional Bihari specialties. Room service is operational 24 hours a day. We also have 'Ice & Spice', our in-house ice cream parlour.",
      },
    ],
  },
  {
    category: "Services & Policies",
    items: [
      {
        question: "Is high-speed Wi-Fi available?",
        answer:
          "Yes. High-speed enterprise fiber Wi-Fi is complimentary for all staying guests across all 33 rooms, suites, lobby, and dining areas.",
      },
      {
        question: "Are pets allowed at the hotel?",
        answer:
          "Pets are not permitted on the property to maintain hygiene and comfort for all guests. Please contact management in advance if traveling with a recognized service animal.",
      },
    ],
  },
];

export default async function FaqPage() {
  // Flatten all faqs for schema
  const allFaqs = CATEGORIZED_FAQS.flatMap((cat) => cat.items);
  const faqSchema = generateFaqSchema(allFaqs);

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-3">
            <Breadcrumbs
              items={[{ name: "FAQ", url: "/faq" }]}
              currentUrl="/faq"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Clear Answers & Guidance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Everything you need to know about reserving rooms, arrival timings, payment options,
            dining at Takshshila Restaurant, and guest policies at Hotel Rajhans International.
          </p>
        </div>
      </section>

      {/* FAQ Categories Section */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            {CATEGORIZED_FAQS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-brown-950 border-b border-brown-900/10 pb-2">
                  {group.category}
                </h2>
                <div className="space-y-3">
                  {group.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="p-5 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-2"
                    >
                      <h3 className="font-bold text-sm text-brown-950 flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" />
                        <span>{item.question}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-brown-800/90 leading-relaxed pl-6">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Help Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-cream-soft border border-gold-400/30 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-xl font-bold text-brown-950 mb-2">
                Have Another Question?
              </h3>
              <p className="text-xs text-brown-700 mb-6 leading-relaxed">
                Our front desk team is on standby 24 hours a day to assist with reservations,
                directions, and customized requirements.
              </p>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${HOTEL_INFO.telephone}`}
                  className="w-full py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider text-center block shadow-sm transition-colors"
                >
                  Call Front Desk: {HOTEL_INFO.telephone}
                </a>
                <Link
                  href="/contact"
                  className="w-full py-2.5 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider text-center block transition-colors"
                >
                  Send Inquiry Message
                </Link>
                <Link
                  href="/booking"
                  className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-brown-950 font-bold text-xs uppercase tracking-wider text-center block transition-colors shadow-xs"
                >
                  Book Your Stay Online
                </Link>
              </div>

              <div className="pt-4 border-t border-brown-900/10 text-xs text-brown-800 space-y-1">
                <p className="font-semibold text-brown-950">Hotel Address:</p>
                <p className="text-brown-600">{HOTEL_INFO.address.streetAddress}, Bhagalpur</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
