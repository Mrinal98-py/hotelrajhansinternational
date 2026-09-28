"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  Eye,
  X
} from "lucide-react";

import { adminFetch } from "@/lib/admin-fetch";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    setErrorMessage(null);
    const query = new URLSearchParams();
    if (statusFilter !== "ALL") query.set("status", statusFilter);
    if (search) query.set("search", search);

    adminFetch(`/api/bookings?${query.toString()}`)
      .then(async (res) => {
        const d = await res.json();
        if (res.ok && d.success) {
          setBookings(d.bookings || []);
        } else {
          setErrorMessage(d.error || `HTTP ${res.status}: Failed to fetch reservations`);
        }
      })
      .catch((err) => {
        setErrorMessage(err.message || "Network error loading reservations");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await adminFetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBookings((prev) => prev.map((b: any) => (b.id === id ? data.booking : b)));
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(data.booking);
        }
        fetchBookings();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
            Booking Reservations
          </h1>
          <p className="text-sm text-slate-700 mt-1 font-semibold">
            Manage, verify, check in/out, and process guest reservations.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs flex items-center gap-2 cursor-pointer self-start font-bold"
        >
          <RefreshCw className={`h-4 w-4 text-slate-900 ${loading ? "animate-spin" : ""}`} /> Refresh Table
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search by Guest Name, Phone, HRJ-Ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:border-slate-400"
          />
        </form>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-50 text-slate-800 border border-slate-300 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={fetchBookings}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bookings Data Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-900 uppercase tracking-widest text-[10px] font-extrabold">
                <th className="py-3.5 px-4 text-slate-900">Booking Ref</th>
                <th className="py-3.5 px-4 text-slate-900">Guest Info</th>
                <th className="py-3.5 px-4 text-slate-900">Room Type</th>
                <th className="py-3.5 px-4 text-slate-900">Check-In / Out</th>
                <th className="py-3.5 px-4 text-slate-900">Guests</th>
                <th className="py-3.5 px-4 text-slate-900">Net Amount</th>
                <th className="py-3.5 px-4 text-slate-900">Status</th>
                <th className="py-3.5 px-4 text-right text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-900 font-bold">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-900" />
                    Loading reservations...
                  </td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-100 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.referenceId}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.customer?.name}</div>
                      <div className="text-[10px] text-slate-800 font-mono font-semibold">{b.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{b.room?.name}</td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-900 font-mono font-semibold">
                      {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-semibold">{b.guestsCount} Guest(s)</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">₹{b.netAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase font-extrabold tracking-wider border ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : b.status === "CHECKED_IN"
                            ? "bg-sky-100 text-sky-900 border-sky-300"
                            : b.status === "CHECKED_OUT"
                            ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                            : b.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-900 border-rose-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-900 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-900" />
                      </button>
                      <a
                        href={`/api/invoice/${b.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-900"
                        title="Download Invoice"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-900" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-900 text-xs font-semibold">
                    No reservations found matching filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 text-slate-700 hover:text-slate-900 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest font-extrabold">
                Reservation Details
              </span>
              <h2 className="font-serif text-2xl text-slate-900 font-bold">
                {selectedBooking.referenceId}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-slate-700 block text-[10px] uppercase font-bold">Guest Name</span>
                <span className="font-bold text-slate-900">{selectedBooking.customer?.name}</span>
              </div>
              <div>
                <span className="text-slate-700 block text-[10px] uppercase font-bold">Phone</span>
                <span className="font-mono font-bold text-slate-900">{selectedBooking.customer?.phone}</span>
              </div>
              <div>
                <span className="text-slate-700 block text-[10px] uppercase font-bold">Room Type</span>
                <span className="font-bold text-slate-900">{selectedBooking.room?.name}</span>
              </div>
              <div>
                <span className="text-slate-700 block text-[10px] uppercase font-bold">Net Amount</span>
                <span className="font-mono font-bold text-slate-900">₹{selectedBooking.netAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-700 block text-[10px] uppercase font-bold">Check-In</span>
                <span className="text-slate-900 font-mono font-semibold">{new Date(selectedBooking.checkIn).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-700 block text-[10px] uppercase font-bold">Check-Out</span>
                <span className="text-slate-900 font-mono font-semibold">{new Date(selectedBooking.checkOut).toLocaleDateString()}</span>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900">
                <span className="text-[10px] text-slate-700 uppercase font-bold block mb-1">Special Requests</span>
                {selectedBooking.specialRequests}
              </div>
            )}

            {/* Quick Status Action Controls */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-slate-900 font-bold">
                Update Booking Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, "CONFIRMED")}
                  disabled={updating}
                  className="py-2.5 px-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 text-xs uppercase font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, "CHECKED_IN")}
                  disabled={updating}
                  className="py-2.5 px-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 text-xs uppercase font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Check In
                </button>
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, "CHECKED_OUT")}
                  disabled={updating}
                  className="py-2.5 px-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 text-xs uppercase font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Check Out
                </button>
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, "CANCELLED")}
                  disabled={updating}
                  className="col-span-3 py-2 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs uppercase font-bold hover:bg-rose-100 cursor-pointer"
                >
                  Cancel Booking
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-200 text-xs">
              <a
                href={`/api/invoice/${selectedBooking.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-900 hover:text-black underline font-mono text-xs flex items-center gap-1 font-bold"
              >
                <FileText className="h-4 w-4" /> Open Full Invoice
              </a>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
