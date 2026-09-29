"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Users,
  CheckCircle2,
  CreditCard,
  Bed,
  ShieldCheck,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  Tag,
} from "lucide-react";

export default function DedicatedBookingEngine() {
  const searchParams = useSearchParams();
  const initialRoom = searchParams.get("room") || "executive";
  const initialCoupon = searchParams.get("coupon") || "";

  // Normalize initial room
  const normalizeRoom = (val: string) => {
    const lower = val.toLowerCase();
    if (lower.includes("deluxe")) return "deluxe";
    if (lower.includes("royal") || lower.includes("suite")) return "royal";
    return "executive";
  };

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomType: normalizeRoom(initialRoom),
    name: "",
    phone: "",
    email: "",
    specialRequests: "",
    couponCode: initialCoupon,
  });

  const [roomRates, setRoomRates] = useState<Record<string, { single: number; double: number }>>({
    executive: { single: 3790, double: 4490 },
    deluxe: { single: 3790, double: 4490 },
    royal: { single: 5190, double: 5190 },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Set default dates: check-in today, check-out tomorrow
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      checkIn: prev.checkIn || formatDate(today),
      checkOut: prev.checkOut || formatDate(tomorrow),
    }));
  }, []);

  // Update room from query param if changed
  useEffect(() => {
    if (searchParams.get("room")) {
      setFormData((prev) => ({
        ...prev,
        roomType: normalizeRoom(searchParams.get("room") || "executive"),
      }));
    }
    if (searchParams.get("coupon")) {
      setFormData((prev) => ({
        ...prev,
        couponCode: searchParams.get("coupon") || "",
      }));
    }
  }, [searchParams]);

  // Load dynamic room rates from API
  useEffect(() => {
    fetch("/api/rooms", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rooms) {
          const rates: Record<string, { single: number; double: number }> = {};
          data.rooms.forEach((r: any) => {
            const key = r.type.toLowerCase().replace("royal_suite", "royal");
            rates[key] = { single: r.basePriceSingle, double: r.basePriceDouble };
          });
          setRoomRates((prev) => ({ ...prev, ...rates }));
        }
      })
      .catch(console.error);
  }, []);

  const loadCashfreeSdk = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).Cashfree) {
        return resolve((window as any).Cashfree);
      }
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.onload = () => resolve((window as any).Cashfree);
      script.onerror = () => resolve(null);
      document.body.appendChild(script);
    });
  };

  const calculateEstimate = () => {
    const currentRate = roomRates[formData.roomType] || { single: 3790, double: 4490 };
    const isSingle = parseInt(formData.guests, 10) === 1;
    const baseNightPrice = isSingle ? currentRate.single : currentRate.double;

    let nights = 1;
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn).getTime();
      const end = new Date(formData.checkOut).getTime();
      const diff = Math.ceil((end - start) / (1000 * 3600 * 24));
      nights = diff > 0 ? diff : 1;
    }

    const subtotal = baseNightPrice * nights;
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;

    return { nights, baseNightPrice, subtotal, gst, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Availability check & create booking via existing /api/bookings
      const res = await fetch("/api/bookings", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Selected room is not available for these dates.");
      }

      // 2. Create Cashfree payment order via existing API
      const cfRes = await fetch("/api/payments/cashfree/create-order", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: data.booking.id }),
      });

      const cfData = await cfRes.json();
      if (!cfRes.ok || !cfData.success) {
        throw new Error(cfData.error || "Failed to initialize payment gateway.");
      }

      // 3. Trigger Cashfree Web SDK Checkout Popup
      const CashfreeSdk = await loadCashfreeSdk();
      if (CashfreeSdk && cfData.paymentSessionId) {
        try {
          const cashfree = CashfreeSdk({
            mode: cfData.environment === "PRODUCTION" ? "production" : "sandbox",
          });

          await cashfree.checkout({
            paymentSessionId: cfData.paymentSessionId,
            redirectTarget: "_modal",
          });
        } catch (checkoutErr) {
          console.warn("Cashfree Checkout Notice:", checkoutErr);
        }
      }

      // 4. Server-Side Payment Verification (Required)
      const verifyRes = await fetch("/api/payments/cashfree/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.booking.id,
          orderId: cfData.orderId,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setBookingRef(verifyData.bookingReference);
        setIsSubmitted(true);
      } else {
        throw new Error(verifyData.error || "Payment verification failed. If debited, contact front desk.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { nights, subtotal, gst, total } = calculateEstimate();

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-cream-soft border border-gold-400/30 shadow-xl text-center space-y-6 my-12">
        <div className="h-16 w-16 rounded-full bg-gold-500/20 text-gold-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-800 font-bold block mb-1">
            Payment Verified & Confirmed
          </span>
          <h2 className="font-serif text-3xl font-bold text-brown-950">
            Reservation Successful!
          </h2>
          <p className="text-sm text-brown-800 mt-2">
            Your stay at Hotel Rajhans International has been confirmed. A confirmation SMS & email
            have been dispatched to your contact details.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brown-900/10 text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-brown-900/10 pb-2">
            <span className="text-brown-600">Booking Reference:</span>
            <span className="font-mono font-bold text-brown-950 text-sm">{bookingRef}</span>
          </div>
          <div className="flex justify-between border-b border-brown-900/10 pb-2">
            <span className="text-brown-600">Guest Name:</span>
            <span className="font-semibold text-brown-950">{formData.name}</span>
          </div>
          <div className="flex justify-between border-b border-brown-900/10 pb-2">
            <span className="text-brown-600">Room Category:</span>
            <span className="font-semibold text-brown-950 uppercase">{formData.roomType}</span>
          </div>
          <div className="flex justify-between border-b border-brown-900/10 pb-2">
            <span className="text-brown-600">Dates:</span>
            <span className="font-semibold text-brown-950">
              {formData.checkIn} to {formData.checkOut} ({nights} Night{nights > 1 ? "s" : ""})
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-brown-600">Total Paid (Incl. GST):</span>
            <span className="font-mono font-bold text-gold-900 text-sm">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Return to Homepage
          </Link>
          <a
            href="tel:+919308189201"
            className="flex-1 py-3 rounded-xl border border-brown-900/20 hover:bg-brown-900/5 text-brown-900 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Call Front Desk
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Booking Form Column */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="bg-cream-soft rounded-3xl border border-brown-900/10 p-6 sm:p-10 shadow-xs space-y-8"
          >
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold-800 font-bold block mb-1">
                Step 1 of 2 • Stay Details
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brown-950">
                Reserve Your Room
              </h2>
              <p className="text-xs sm:text-sm text-brown-700 mt-1">
                Best direct rates guaranteed. Instant verification via Cashfree payment gateway.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Room Type Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-brown-900">
                Select Room Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "executive",
                    name: "AC Executive",
                    price: roomRates.executive?.single || 3790,
                    desc: "Solo & Business • Queen Bed",
                  },
                  {
                    id: "deluxe",
                    name: "AC Deluxe",
                    price: roomRates.deluxe?.single || 3790,
                    desc: "Pocket-Spring • Extra Space",
                  },
                  {
                    id: "royal",
                    name: "Royal Suite",
                    price: roomRates.royal?.single || 5190,
                    desc: "Bedroom + Lounge • 2 Washrooms",
                  },
                ].map((item) => {
                  const isSelected = formData.roomType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, roomType: item.id })}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-brown-950 bg-brown-950 text-white shadow-sm"
                          : "border-brown-900/15 bg-white text-brown-900 hover:border-gold-400"
                      }`}
                    >
                      <div className="font-serif font-bold text-sm mb-1">{item.name}</div>
                      <div className={`text-[11px] mb-2 ${isSelected ? "text-gold-300" : "text-brown-600"}`}>
                        {item.desc}
                      </div>
                      <div className="font-mono font-bold text-xs">
                        From ₹{item.price.toLocaleString("en-IN")}/night
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brown-900 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brown-600" />
                  <span>Check-In Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brown-900 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brown-600" />
                  <span>Check-Out Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  min={formData.checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brown-900 mb-1 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-brown-600" />
                  <span>Guests *</span>
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900"
                >
                  <option value="1">1 Guest (Single Occupancy)</option>
                  <option value="2">2 Guests (Double Occupancy)</option>
                  <option value="3">3 Guests (with Extra Bed)</option>
                  <option value="4">4 Guests (Royal Suite / Family)</option>
                </select>
              </div>
            </div>

            {/* Guest Details */}
            <div className="pt-4 border-t border-brown-900/10 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold-800 font-bold block">
                Step 2 of 2 • Guest Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brown-900 mb-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-brown-600" />
                    <span>Primary Guest Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name as on Govt ID"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brown-900 mb-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-brown-600" />
                    <span>Mobile Number (For WhatsApp / SMS) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brown-900 mb-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-brown-600" />
                    <span>Email Address (For Invoice) *</span>
                  </label>
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
                  <label className="block text-xs font-semibold text-brown-900 mb-1 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-brown-600" />
                    <span>Coupon / Promo Code (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIRECT10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brown-900 mb-1">
                  Special Requests / Arrival Time (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="e.g., Late check-in after 8 PM, high floor, quiet room, extra towels..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brown-900/20 bg-white text-xs text-brown-950 focus:outline-hidden focus:border-brown-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-brown-900 hover:bg-brown-800 disabled:opacity-50 text-cream font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <CreditCard className="h-4 w-4 text-gold-400" />
              <span>{isSubmitting ? "Processing Reservation..." : "Proceed to Secure Payment (Cashfree)"}</span>
            </button>
          </form>
        </div>

        {/* Price Summary Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-cream-soft rounded-3xl border border-gold-400/30 p-6 sm:p-7 shadow-xs sticky top-24 space-y-6">
            <h3 className="font-serif text-xl font-bold text-brown-950 border-b border-brown-900/10 pb-3">
              Booking Summary
            </h3>

            <div className="space-y-3 text-xs text-brown-800">
              <div className="flex justify-between">
                <span className="text-brown-600">Selected Room:</span>
                <span className="font-bold text-brown-950 uppercase">{formData.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-600">Check-In:</span>
                <span className="font-semibold text-brown-950">{formData.checkIn || "Select date"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-600">Check-Out:</span>
                <span className="font-semibold text-brown-950">{formData.checkOut || "Select date"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-600">Stay Duration:</span>
                <span className="font-semibold text-brown-950">
                  {nights} Night{nights > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-600">Guests:</span>
                <span className="font-semibold text-brown-950">{formData.guests} Guest(s)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-brown-900/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-brown-600">Base Room Rate ({nights} night{nights > 1 ? "s" : ""}):</span>
                <span className="font-mono font-semibold text-brown-950">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-brown-600">
                <span>Taxes & GST (5%):</span>
                <span className="font-mono">₹{gst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brown-900/10 font-bold text-sm text-brown-950">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-gold-900">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-brown-900/10 space-y-2 text-[11px] text-brown-700">
              <div className="flex items-center gap-1.5 font-bold text-brown-950">
                <ShieldCheck className="h-3.5 w-3.5 text-gold-700" />
                <span>Cashfree PCI-DSS Secure</span>
              </div>
              <p>
                Accepts UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, and Net Banking with 256-bit encryption.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
