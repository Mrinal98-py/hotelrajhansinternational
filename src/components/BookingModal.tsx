"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, Home, User, Phone, Mail, Award, CheckCircle, CreditCard, FileText } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoomDefault?: string;
  roomStatuses?: Record<string, string>;
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedRoomDefault = "executive",
  roomStatuses,
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomType: selectedRoomDefault,
    name: "",
    phone: "",
    email: "",
    specialRequests: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      let normalized = (selectedRoomDefault || "executive").toLowerCase();
      if (normalized.includes("executive")) normalized = "executive";
      else if (normalized.includes("deluxe")) normalized = "deluxe";
      else if (normalized.includes("royal") || normalized.includes("suite")) normalized = "royal";
      else if (normalized.includes("dormitory") || normalized.includes("group")) normalized = "dormitory";

      // If requested room is not available, default to the first available category
      if (roomStatuses && roomStatuses[normalized] !== "AVAILABLE") {
        const availableAlt = ["executive", "deluxe", "royal", "dormitory"].find(
          (k) => roomStatuses[k] === "AVAILABLE"
        );
        if (availableAlt) {
          normalized = availableAlt;
        }
      }

      setFormData((prev) => ({
        ...prev,
        roomType: normalized,
      }));
    }
  }, [isOpen, selectedRoomDefault, roomStatuses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadCashfreeSdk = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).Cashfree) {
        return resolve((window as any).Cashfree);
      }
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.onload = () => {
        resolve((window as any).Cashfree);
      };
      script.onerror = () => resolve(null);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (roomStatuses && roomStatuses[formData.roomType] && roomStatuses[formData.roomType] !== "AVAILABLE") {
      setErrorMessage(
        `The selected room is currently ${roomStatuses[formData.roomType]?.toLowerCase()}. Please pick an available room.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Availability check & create booking (PENDING)
      const res = await fetch("/api/bookings", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Selected room is not available for these dates.");
      }

      // 2. Create Cashfree payment order
      const cfRes = await fetch("/api/payments/cashfree/create-order", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
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
          console.warn("Cashfree Modal Checkout Notice:", checkoutErr);
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
        setBookingId(data.booking.id);
        setIsSubmitted(true);
      } else {
        throw new Error(verifyData.error || "Payment verification failed.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSubmitted(false);
      setIsSubmitting(false);
      setErrorMessage("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-cream/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden rounded-lg border border-gold-400/20 bg-cream-soft shadow-2xl"
          >
            {/* Top Gold Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gold-200/60 hover:text-gold-300 transition-colors rounded-full hover:bg-brown-900/5 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {!isSubmitted ? (
              <div className="p-6 md:p-8">
                <div className="mb-6 text-center">
                  <h3 className="font-serif text-2xl md:text-3xl text-gold-300 tracking-wide font-medium">
                    Book a room
                  </h3>
                  <p className="text-gold-200/60 text-xs tracking-widest uppercase mt-1">
                    Live Room Availability & Instant Confirmation
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-900/10 border border-red-500/30 rounded-lg text-red-700 text-xs text-center font-medium">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Reservation Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-gold-200/80 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gold-400" /> Check-In
                      </label>
                      <input
                        type="date"
                        name="checkIn"
                        required
                        value={formData.checkIn}
                        onChange={handleChange}
                        className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 focus:outline-none focus:border-gold-400/50 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-gold-200/80 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gold-400" /> Check-Out
                      </label>
                      <input
                        type="date"
                        name="checkOut"
                        required
                        value={formData.checkOut}
                        onChange={handleChange}
                        className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 focus:outline-none focus:border-gold-400/50 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Suite selection and Guests */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-gold-200/80 mb-1.5 flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-gold-400" /> Room type
                      </label>
                      <select
                        name="roomType"
                        value={formData.roomType}
                        onChange={handleChange}
                        className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 focus:outline-none focus:border-gold-400/50 transition-colors text-sm"
                      >
                        {(!roomStatuses || roomStatuses.executive !== "DEACTIVATED") && (
                          <option
                            value="executive"
                            disabled={Boolean(roomStatuses && roomStatuses.executive !== "AVAILABLE")}
                          >
                            Executive Room {roomStatuses?.executive === "OCCUPIED" ? "— [Occupied]" : roomStatuses?.executive === "MAINTENANCE" ? "— [Under Maintenance]" : "(₹3,090 - ₹3,790)"}
                          </option>
                        )}
                        {(!roomStatuses || roomStatuses.deluxe !== "DEACTIVATED") && (
                          <option
                            value="deluxe"
                            disabled={Boolean(roomStatuses && roomStatuses.deluxe !== "AVAILABLE")}
                          >
                            Deluxe Room {roomStatuses?.deluxe === "OCCUPIED" ? "— [Occupied]" : roomStatuses?.deluxe === "MAINTENANCE" ? "— [Under Maintenance]" : "(₹3,790 - ₹4,490)"}
                          </option>
                        )}
                        {(!roomStatuses || roomStatuses.royal !== "DEACTIVATED") && (
                          <option
                            value="royal"
                            disabled={Boolean(roomStatuses && roomStatuses.royal !== "AVAILABLE")}
                          >
                            Royal Suite {roomStatuses?.royal === "OCCUPIED" ? "— [Occupied]" : roomStatuses?.royal === "MAINTENANCE" ? "— [Under Maintenance]" : "(₹5,190)"}
                          </option>
                        )}
                        {(!roomStatuses || roomStatuses.dormitory !== "DEACTIVATED") && (
                          <option
                            value="dormitory"
                            disabled={Boolean(roomStatuses && roomStatuses.dormitory !== "AVAILABLE")}
                          >
                            Dormitory {roomStatuses?.dormitory === "OCCUPIED" ? "— [Occupied]" : roomStatuses?.dormitory === "MAINTENANCE" ? "— [Under Maintenance]" : "(Group stay)"}
                          </option>
                        )}
                      </select>
                      {roomStatuses && roomStatuses[formData.roomType] === "OCCUPIED" && (
                        <p className="mt-1 text-[11px] text-rose-300 font-medium">
                          ⚠️ This room is currently occupied. Please pick an alternative available room.
                        </p>
                      )}
                      {roomStatuses && roomStatuses[formData.roomType] === "MAINTENANCE" && (
                        <p className="mt-1 text-[11px] text-amber-300 font-medium">
                          ⚠️ This room is currently undergoing maintenance.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-gold-200/80 mb-1.5 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-gold-400" /> Guests
                      </label>
                      <select
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 focus:outline-none focus:border-gold-400/50 transition-colors text-sm"
                      >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="5">5+ Guests (Group)</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-gold-400/10 my-2" />

                  {/* Personal details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-gold-200/80 mb-1.5 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-gold-400" /> Full name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 placeholder-gold-200/20 focus:outline-none focus:border-gold-400/50 transition-colors text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-gold-200/80 mb-1.5 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gold-400" /> Contact Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+91 98765 43210"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 placeholder-gold-200/20 focus:outline-none focus:border-gold-400/50 transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-gold-200/80 mb-1.5 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gold-400" /> Email address
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 placeholder-gold-200/20 focus:outline-none focus:border-gold-400/50 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-gold-200/80 mb-1.5">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        name="specialRequests"
                        rows={2}
                        placeholder="Arrival time, extra bed request, etc."
                        value={formData.specialRequests}
                        onChange={handleChange}
                        className="w-full bg-paper border border-gold-400/20 rounded-lg py-2.5 px-3 text-gold-100 placeholder-gold-200/20 focus:outline-none focus:border-gold-400/50 transition-colors text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-700 hover:to-gold-500 text-brown-900 font-semibold uppercase tracking-widest text-xs py-3.5 px-6 rounded-lg transition-all duration-300 shadow-md shadow-gold-400/10 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Verifying Availability & Booking...</span>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" /> Confirm & Pay via Cashfree
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-gold-400/10 rounded-full flex items-center justify-center border border-gold-400/30 text-gold-400">
                  <CheckCircle className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-gold-400 font-bold">
                    Reservation Confirmed
                  </span>
                  <h3 className="font-serif text-3xl text-gold-300">
                    {bookingRef}
                  </h3>
                  <p className="text-gold-200/70 text-xs max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-gold-100">{formData.name}</strong>. Your room reservation has been confirmed and verified. A receipt has been sent to your email.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`/api/invoice/${bookingId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-paper border border-gold-400/30 text-gold-100 hover:text-gold-300 text-xs uppercase font-medium tracking-widest py-3 px-6 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4 text-gold-400" /> View Tax Invoice
                  </a>
                  <button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-gold-600 to-gold-400 text-brown-900 font-semibold uppercase tracking-widest text-xs py-3 px-6 rounded-lg shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
