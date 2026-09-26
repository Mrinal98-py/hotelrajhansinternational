"use client";

import { useEffect, useState } from "react";
import { Star, RefreshCw } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    adminFetch("/api/reviews")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setReviews(d.reviews);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateReviewStatus = async (id: string, newStatus: string) => {
    try {
      const res = await adminFetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error("Update review error:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
            Guest Reviews Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Approve, feature, or hide guest testimonials displayed on the public site.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-100 text-xs flex items-center gap-2 cursor-pointer self-start font-semibold"
        >
          <RefreshCw className={`h-4 w-4 text-slate-700 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-700 font-bold">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading reviews...
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-300 font-serif font-bold text-slate-700 text-sm">
                      {r.authorInitials}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{r.authorName}</h4>
                      <span className="text-[10px] text-slate-500/70 font-mono">{r.source}</span>
                    </div>
                  </div>
                  <div className="flex text-slate-500 gap-0.5">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-slate-500" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-900 italic leading-relaxed font-medium">&ldquo;{r.reviewText}&rdquo;</p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                  r.status === "FEATURED"
                    ? "bg-slate-100 text-slate-700 border border-slate-300"
                    : r.status === "APPROVED"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}>
                  {r.status}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateReviewStatus(r.id, "FEATURED")}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase cursor-pointer"
                  >
                    Feature
                  </button>
                  <button
                    onClick={() => updateReviewStatus(r.id, "APPROVED")}
                    className="px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateReviewStatus(r.id, "REJECTED")}
                    className="px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center text-slate-500 text-xs">
            No guest reviews recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
