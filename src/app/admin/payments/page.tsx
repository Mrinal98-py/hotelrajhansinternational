"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPayments = () => {
    setLoading(true);
    setErrorMessage(null);
    adminFetch("/api/payments")
      .then(async (res) => {
        const d = await res.json();
        if (res.ok && d.success && d.payments) {
          setPayments(d.payments);
        } else {
          setErrorMessage(d.error || `HTTP ${res.status}: Failed to fetch payments`);
        }
      })
      .catch((err) => {
        setErrorMessage(err.message || "Network error loading payments");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold";
      case "PENDING":
        return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
      case "FAILED":
      case "REFUNDED":
        return "bg-rose-100 text-rose-900 border-rose-300 font-bold";
      default:
        return "bg-slate-100 text-slate-900 border-slate-300 font-bold";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
            Payment Audit Transactions
          </h1>
          <p className="text-xs text-slate-700 mt-1 font-semibold">
            Real-time Cashfree payment logs, transaction verification, and gateway responses.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={fetchPayments}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs flex items-center gap-2 cursor-pointer font-semibold"
          >
            <RefreshCw className={`h-4 w-4 text-slate-900 ${loading ? "animate-spin" : ""}`} /> Refresh Log
          </button>
          <button
            onClick={async () => {
              if (confirm("Are you sure you want to clear all test payment logs and reset financial metrics to zero?")) {
                setLoading(true);
                try {
                  const res = await adminFetch("/api/payments/reset", { method: "POST" });
                  const data = await res.json();
                  if (data.success) {
                    alert("Payment values reset successfully!");
                    fetchPayments();
                  } else {
                    alert(data.error || "Failed to reset payments.");
                  }
                } catch {
                  alert("Error resetting payments.");
                } finally {
                  setLoading(false);
                }
              }
            }}
            className="p-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            Reset Payment Data
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={fetchPayments}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-amber-500/20 text-slate-900 uppercase tracking-widest text-[10px] font-extrabold">
                <th className="py-3.5 px-4 text-slate-900">Cashfree Payment ID</th>
                <th className="py-3.5 px-4 text-slate-900">Booking Ref</th>
                <th className="py-3.5 px-4 text-slate-900">Guest Name</th>
                <th className="py-3.5 px-4 text-slate-900">Method</th>
                <th className="py-3.5 px-4 text-slate-900">Amount</th>
                <th className="py-3.5 px-4 text-slate-900">Status</th>
                <th className="py-3.5 px-4 text-slate-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 text-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-900 font-bold">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-900" />
                    Loading payment audit transactions...
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-100 transition-colors text-slate-900 font-medium">
                    <td className="py-3.5 px-4 font-mono text-slate-900 font-bold">
                      {p.cashfreePaymentId || p.cashfreeOrderId || p.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.bookingRef}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.customerName}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] uppercase font-bold text-slate-800">{p.method}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">₹{p.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 text-[11px] font-mono font-semibold">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-900 text-xs font-semibold">
                    No payment gateway transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
