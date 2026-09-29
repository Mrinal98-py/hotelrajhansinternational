"use client";

import { useState } from "react";
import { Star, CheckCircle2, Send } from "lucide-react";

export default function ReviewSubmissionForm() {
  const [formData, setFormData] = useState({
    authorName: "",
    rating: 5,
    reviewText: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSubmitted(true);
      setFormData({ authorName: "", rating: 5, reviewText: "" });
    } catch (err: any) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-2xl bg-cream-soft border border-brown-900/10 text-center space-y-2">
        <CheckCircle2 className="h-8 w-8 text-gold-600 mx-auto" />
        <h4 className="font-serif text-lg font-bold text-brown-950">Thank You for Your Feedback!</h4>
        <p className="text-xs text-brown-700 leading-relaxed max-w-md mx-auto">
          Your review has been submitted for verification. It will appear on our public reviews page
          once approved by management.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-cream-soft border border-brown-900/10 space-y-4">
      <div>
        <h3 className="font-serif text-xl font-bold text-brown-950 mb-1">
          Share Your Stay Experience
        </h3>
        <p className="text-xs text-brown-700">
          We value genuine guest feedback to maintain our hospitality benchmarks.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-brown-900 mb-1">Your Full Name *</label>
        <input
          type="text"
          required
          value={formData.authorName}
          onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
          placeholder="e.g. Ramesh Kumar"
          className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-brown-900 mb-1">Overall Rating *</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setFormData({ ...formData, rating: star })}
              className="p-1 cursor-pointer"
            >
              <Star
                className={`h-5 w-5 ${
                  star <= formData.rating
                    ? "fill-gold-500 text-gold-500"
                    : "text-brown-300 hover:text-gold-400"
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-bold text-brown-900 ml-2">
            {formData.rating} out of 5 Stars
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-brown-900 mb-1">Your Review *</label>
        <textarea
          required
          rows={4}
          value={formData.reviewText}
          onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
          placeholder="Describe your room experience, cleanliness, food, and staff service..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-brown-900 hover:bg-brown-800 disabled:opacity-50 text-cream font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Send className="h-3.5 w-3.5 text-gold-400" />
        <span>{isSubmitting ? "Submitting Review..." : "Submit Verified Review"}</span>
      </button>
    </form>
  );
}
