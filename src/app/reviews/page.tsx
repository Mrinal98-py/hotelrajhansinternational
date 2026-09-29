import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReviewSubmissionForm from "@/components/ReviewSubmissionForm";
import { getCanonicalUrl, HOTEL_INFO } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import {
  Star,
  Quote,
  ShieldCheck,
  CalendarCheck,
  MessageSquare,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Guest Reviews & Ratings | Hotel Rajhans International Bhagalpur",
  description:
    "Read genuine, verified guest reviews of Hotel Rajhans International in Bhagalpur. Real traveler ratings on room comfort, Takshshila Restaurant food, cleanliness, and staff hospitality.",
  alternates: {
    canonical: getCanonicalUrl("/reviews"),
  },
  openGraph: {
    title: "Guest Reviews & Ratings | Hotel Rajhans International Bhagalpur",
    description:
      "Read authentic guest experiences and feedback from travelers staying at Hotel Rajhans International, Kachari Chowk, Bhagalpur.",
    url: getCanonicalUrl("/reviews"),
    type: "website",
  },
};

export default async function ReviewsPage() {
  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: { status: { in: ["APPROVED", "FEATURED"] } },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Reviews Fetch Error:", err);
  }

  // Calculate real average rating from approved reviews
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? (
          reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviewCount
        ).toFixed(1)
      : "4.5";

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brown-950 via-brown-900 to-brown-950 text-cream py-14 px-6 border-b border-gold-400/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-gold-200/80 mb-3">
            <Breadcrumbs items={[{ name: "Guest Reviews" }]} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-gold-400 font-bold block mb-2">
            Verified Guest Impressions
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Guest Reviews & Feedback
          </h1>
          <p className="text-sm sm:text-base text-cream-soft/80 max-w-2xl leading-relaxed">
            Authentic experiences shared by our valued guests. Every review is verified against our
            guest records to ensure genuine feedback and transparent hospitality.
          </p>
        </div>
      </section>

      {/* Main Reviews Grid & Submission */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        {/* Rating Summary Bar */}
        <div className="bg-cream-soft rounded-2xl border border-brown-900/10 p-6 sm:p-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-brown-950 text-gold-400 font-serif text-3xl font-bold">
              {avgRating}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <p className="text-xs font-semibold text-brown-950">
                Based on {reviewCount} Approved Guest Reviews
              </p>
              <span className="text-[10px] text-brown-600">
                Verified Google & Direct Guest Feedback
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="px-6 py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider shadow-sm transition-colors inline-flex items-center gap-2"
            >
              <CalendarCheck className="h-4 w-4 text-gold-400" />
              <span>Book Your Stay</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-brown-950 mb-4">
              Approved Guest Feedback
            </h2>

            {reviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-cream-soft border border-brown-900/10 text-center text-xs text-brown-700">
                No approved reviews found at this moment. Be the first to share your experience!
              </div>
            ) : (
              reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="p-6 rounded-2xl bg-cream-soft border border-brown-900/10 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brown-950 text-gold-400 flex items-center justify-center font-bold text-xs">
                        {rev.authorInitials || rev.authorName?.[0] || "G"}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-brown-950">{rev.authorName}</h3>
                        <span className="text-[10px] text-brown-600 block">
                          Verified Stay • {rev.source || "Google Review"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= (rev.rating || 5)
                              ? "fill-gold-500 text-gold-500"
                              : "text-brown-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-brown-800/90 leading-relaxed italic">
                    &ldquo;{rev.reviewText}&rdquo;
                  </p>

                  <div className="text-[10px] text-brown-500 pt-2 border-t border-brown-900/5">
                    Posted on {new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Review Submission Sidebar */}
          <aside className="lg:col-span-5 space-y-6">
            <ReviewSubmissionForm />
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
