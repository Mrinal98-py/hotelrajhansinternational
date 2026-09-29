"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit message. Please try again or call us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-3xl bg-cream-soft border border-brown-900/10 text-center space-y-3 shadow-xs">
        <CheckCircle2 className="h-10 w-10 text-gold-600 mx-auto" />
        <h3 className="font-serif text-2xl font-bold text-brown-950">Message Received</h3>
        <p className="text-xs sm:text-sm text-brown-800 leading-relaxed max-w-md mx-auto">
          Thank you for reaching out to Hotel Rajhans International. Our front desk manager will review
          your inquiry and contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-cream-soft border border-brown-900/10 space-y-5 shadow-xs"
    >
      <div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-brown-950">
          Send Us a Direct Message
        </h3>
        <p className="text-xs text-brown-700 mt-1">
          Have an inquiry regarding wedding bookings, corporate packages, or group stays?
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-brown-900 mb-1">Your Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Anand Jha"
            className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brown-900 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brown-900 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 93081 89201"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brown-900 mb-1">Your Message or Inquiry *</label>
          <textarea
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us about your dates, group size, special requirements, or questions..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-2xl bg-brown-900 hover:bg-brown-800 disabled:opacity-50 text-cream font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
      >
        <Send className="h-3.5 w-3.5 text-gold-400" />
        <span>{isSubmitting ? "Sending Inquiry..." : "Submit Message"}</span>
      </button>
    </form>
  );
}
