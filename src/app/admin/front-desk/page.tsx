"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ConciergeBell,
  CalendarCheck,
  BedDouble,
  Users,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  CreditCard,
  FileText,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export default function FrontDeskPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"ARRIVALS" | "DEPARTURES" | "IN_HOUSE" | "ALL">("ARRIVALS");
  const [searchQuery, setSearchQuery] = useState("");

  const [bookings, setBookings] = useState<any[]>([]);
  const [physicalRooms, setPhysicalRooms] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    idProofType: "AADHAAR",
    idProofNumber: "",
    roomTypeId: "",
    physicalRoomId: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    paidAmount: "",
    paymentMethod: "CASH",
    paymentReferenceNote: "Front desk walk-in deposit",
    autoCheckIn: true,
  });
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);

  // Assign Room modal state
  const [assigningBooking, setAssigningBooking] = useState<any | null>(null);
  const [selectedPhysicalRoomId, setSelectedPhysicalRoomId] = useState("");
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // Action status message
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [bookingsRes, roomsRes, typesRes] = await Promise.all([
        adminFetch("/api/bookings?limit=100"),
        adminFetch("/api/rooms/inventory"),
        adminFetch("/api/rooms"),
      ]);

      const [bookingsData, roomsData, typesData] = await Promise.all([
        bookingsRes.json(),
        roomsRes.json(),
        typesRes.json(),
      ]);

      if (bookingsData.success) {
        setBookings(bookingsData.data.bookings || []);
      }
      if (roomsData.success) {
        setPhysicalRooms(roomsData.data.physicalRooms || []);
      }
      if (typesData.rooms) {
        setRoomTypes(typesData.rooms);
      }
    } catch (err: any) {
      console.error("Fetch front desk data error:", err);
      setBannerMessage({ type: "error", text: "Failed to load front desk records" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setWalkInForm((prev) => ({ ...prev, checkIn: today, checkOut: tomorrow }));
  }, [fetchData]);

  // Today's Date Strings
  const todayStr = new Date().toISOString().split("T")[0];

  // Categorize Bookings
  const todayArrivals = bookings.filter((b) => {
    const cin = new Date(b.checkIn).toISOString().split("T")[0];
    return cin === todayStr && b.status === "CONFIRMED";
  });

  const todayDepartures = bookings.filter((b) => {
    const cout = new Date(b.checkOut).toISOString().split("T")[0];
    return cout === todayStr && b.status === "CHECKED_IN";
  });

  const inHouseGuests = bookings.filter((b) => b.status === "CHECKED_IN");

  const filteredBookings = (
    activeTab === "ARRIVALS"
      ? todayArrivals
      : activeTab === "DEPARTURES"
      ? todayDepartures
      : activeTab === "IN_HOUSE"
      ? inHouseGuests
      : bookings
  ).filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.referenceId?.toLowerCase().includes(q) ||
      b.customer?.name?.toLowerCase().includes(q) ||
      b.customer?.phone?.includes(q) ||
      b.roomAssignments?.[0]?.physicalRoom?.roomNumber?.includes(q)
    );
  });

  // Handle Quick Check-In
  const handleCheckIn = async (booking: any) => {
    if (!booking.assignedRoomId && (!booking.roomAssignments || booking.roomAssignments.length === 0)) {
      setAssigningBooking(booking);
      setBannerMessage({
        type: "error",
        text: "Please assign a physical room before checking in.",
      });
      return;
    }

    try {
      const res = await adminFetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CHECKED_IN", reason: "Front desk guest arrival" }),
      });

      const data = await res.json();
      if (data.success) {
        setBannerMessage({
          type: "success",
          text: `Guest ${booking.customer.name} checked in successfully to Room ${booking.roomAssignments?.[0]?.physicalRoom?.roomNumber || ""}`,
        });
        fetchData();
      } else {
        setBannerMessage({ type: "error", text: data.error?.message || "Check-in failed" });
      }
    } catch (err: any) {
      setBannerMessage({ type: "error", text: err.message || "Failed to check in" });
    }
  };

  // Handle Check-Out
  const handleCheckOut = async (booking: any) => {
    const balance = booking.folio?.balanceAmount ?? (booking.netAmount - booking.paidAmount);
    if (balance > 0) {
      const confirmBypass = window.confirm(
        `Guest has an outstanding balance of ₹${balance}. Proceed to checkout and settle, or cancel?`
      );
      if (!confirmBypass) return;
    }

    try {
      const res = await adminFetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CHECKED_OUT",
          reason: "Front desk departure",
          bypassBalanceCheck: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBannerMessage({
          type: "success",
          text: `Guest ${booking.customer.name} checked out. Room marked DIRTY for housekeeping.`,
        });
        fetchData();
      } else {
        setBannerMessage({ type: "error", text: data.error?.message || "Checkout failed" });
      }
    } catch (err: any) {
      setBannerMessage({ type: "error", text: err.message || "Failed to check out" });
    }
  };

  // Handle Room Assignment Submit
  const handleAssignRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking || !selectedPhysicalRoomId) return;

    try {
      setSubmittingAssignment(true);
      const res = await adminFetch("/api/rooms/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: assigningBooking.id,
          physicalRoomId: selectedPhysicalRoomId,
          notes: "Assigned via Front Desk dashboard",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBannerMessage({
          type: "success",
          text: data.message || "Room assigned successfully.",
        });
        setAssigningBooking(null);
        setSelectedPhysicalRoomId("");
        fetchData();
      } else {
        setBannerMessage({ type: "error", text: data.error?.message || "Assignment failed" });
      }
    } catch (err: any) {
      setBannerMessage({ type: "error", text: err.message || "Failed to assign room" });
    } finally {
      setSubmittingAssignment(false);
    }
  };

  // Handle Walk-In Form Submit
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInForm.physicalRoomId || !walkInForm.name || !walkInForm.phone) {
      setBannerMessage({ type: "error", text: "Please complete all required fields." });
      return;
    }

    try {
      setSubmittingWalkIn(true);
      const res = await adminFetch("/api/bookings/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walkInForm),
      });

      const data = await res.json();
      if (data.success) {
        setBannerMessage({
          type: "success",
          text: data.message || "Walk-in booking created successfully!",
        });
        setShowWalkInModal(false);
        fetchData();
      } else {
        setBannerMessage({ type: "error", text: data.error?.message || "Walk-in booking failed." });
      }
    } catch (err: any) {
      setBannerMessage({ type: "error", text: err.message || "Failed to process walk-in" });
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            bannerMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="p-1 hover:opacity-75 cursor-pointer text-slate-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-700 font-bold">
              Today&apos;s Arrivals
            </span>
            <ConciergeBell className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-2">{todayArrivals.length}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Pending Check-in</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-700 font-bold">
              Today&apos;s Departures
            </span>
            <LogOut className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-2">{todayDepartures.length}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Pending Checkout</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-700 font-bold">
              In-House Stays
            </span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-2">{inHouseGuests.length}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Currently Occupied</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-700 font-bold">
              Ready Rooms
            </span>
            <BedDouble className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-2">
            {physicalRooms.filter((r) => r.status === "AVAILABLE" && r.housekeepingStatus === "READY").length}
          </p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Ready for Guest</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ARRIVALS", label: "Arrivals", count: todayArrivals.length },
            { id: "DEPARTURES", label: "Departures", count: todayDepartures.length },
            { id: "IN_HOUSE", label: "In-House Guests", count: inHouseGuests.length },
            { id: "ALL", label: "All Reservations", count: bookings.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === tab.id ? "bg-slate-800 text-amber-400" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, guest, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowWalkInModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5" /> Walk-In Check-In
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading front desk stays...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No records found for the selected view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Stay & Ref</th>
                  <th className="py-3 px-4">Primary Guest</th>
                  <th className="py-3 px-4">Room & Number</th>
                  <th className="py-3 px-4">Dates & Duration</th>
                  <th className="py-3 px-4">Folio & Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const assignedRoom =
                    b.roomAssignments?.find((a: any) => a.status === "ACTIVE" || a.status === "ASSIGNED")
                      ?.physicalRoom || null;
                  const balance =
                    b.folio?.balanceAmount !== undefined
                      ? b.folio.balanceAmount
                      : b.netAmount - b.paidAmount;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link
                          href={`/admin/bookings`}
                          className="hover:text-amber-600 underline underline-offset-2"
                        >
                          {b.referenceId}
                        </Link>
                        <p className="text-[10px] text-slate-600 font-normal mt-0.5">
                          {formatDate(b.createdAt)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{b.customer?.name}</p>
                        <p className="text-[11px] text-slate-600 font-mono">{b.customer?.phone}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {assignedRoom ? (
                            <span className="px-2 py-0.5 bg-slate-900 text-amber-400 font-mono font-bold rounded text-[11px]">
                              Room {assignedRoom.roomNumber}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded text-[10px]">
                              Unassigned
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5">{b.room?.name}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                        </p>
                        <p className="text-[10px] text-slate-600">{b.guestsCount} Guest(s)</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{formatCurrency(b.netAmount)}</p>
                        <p
                          className={`text-[10px] font-mono font-semibold ${
                            balance <= 0 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"
                          }`}
                        >
                          {balance <= 0 ? "Settled" : `Due: ${formatCurrency(balance)}`}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.8 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === "CONFIRMED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : b.status === "CHECKED_IN"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : b.status === "CHECKED_OUT"
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Room */}
                          <button
                            onClick={() => {
                              setAssigningBooking(b);
                              setSelectedPhysicalRoomId(assignedRoom?.id || "");
                            }}
                            className="px-2 py-1 border border-slate-200 rounded text-slate-700 hover:bg-slate-100 text-[11px] font-bold cursor-pointer"
                            title="Assign / Change Room"
                          >
                            Assign
                          </button>

                          {/* Check In Action */}
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleCheckIn(b)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Check In
                            </button>
                          )}

                          {/* Check Out Action */}
                          {b.status === "CHECKED_IN" && (
                            <button
                              onClick={() => handleCheckOut(b)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <LogOut className="h-3 w-3" /> Check Out
                            </button>
                          )}

                          {/* Folio View */}
                          <Link
                            href={`/admin/folios`}
                            className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded text-[11px] font-bold"
                            title="Folio Billing"
                          >
                            Folio
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Room Assignment Modal */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900">Assign Physical Room</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {assigningBooking.referenceId} — {assigningBooking.customer?.name}
                </p>
              </div>
              <button
                onClick={() => setAssigningBooking(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Room Category
                </label>
                <input
                  type="text"
                  disabled
                  value={assigningBooking.room?.name || "Standard Room"}
                  className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Available Physical Room *
                </label>
                <select
                  required
                  value={selectedPhysicalRoomId}
                  onChange={(e) => setSelectedPhysicalRoomId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500 font-semibold"
                >
                  <option value="">-- Choose Physical Room --</option>
                  {physicalRooms
                    .filter((r) => r.roomTypeId === assigningBooking.roomId && r.isActive)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} (Floor {r.floor}) — Status: {r.status} | Housekeeping:{" "}
                        {r.housekeepingStatus}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Rooms under maintenance or occupied are automatically filtered out upon saving.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningBooking(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssignment || !selectedPhysicalRoomId}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingAssignment ? "Assigning..." : "Confirm Room Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900">Front Desk Walk-In Check-In</h3>
                <p className="text-xs text-slate-500">Register new walk-in guest with direct physical room assignment</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={walkInForm.name}
                    onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={walkInForm.phone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={walkInForm.email}
                    onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Address</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={walkInForm.address}
                    onChange={(e) => setWalkInForm({ ...walkInForm, address: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ID Proof Type</label>
                  <select
                    value={walkInForm.idProofType}
                    onChange={(e) => setWalkInForm({ ...walkInForm, idProofType: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="VOTER_ID">Voter ID</option>
                    <option value="OTHER">Other Govt ID</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ID Proof Document No.</label>
                  <input
                    type="text"
                    placeholder="Document Number"
                    value={walkInForm.idProofNumber}
                    onChange={(e) => setWalkInForm({ ...walkInForm, idProofNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={walkInForm.checkIn}
                    onChange={(e) => setWalkInForm({ ...walkInForm, checkIn: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={walkInForm.checkOut}
                    onChange={(e) => setWalkInForm({ ...walkInForm, checkOut: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Physical Room *</label>
                <select
                  required
                  value={walkInForm.physicalRoomId}
                  onChange={(e) => {
                    const sel = physicalRooms.find((r) => r.id === e.target.value);
                    setWalkInForm({
                      ...walkInForm,
                      physicalRoomId: e.target.value,
                      roomTypeId: sel?.roomTypeId || "",
                    });
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-bold"
                >
                  <option value="">-- Select Available Room --</option>
                  {physicalRooms
                    .filter(
                      (r) =>
                        r.status === "AVAILABLE" &&
                        r.housekeepingStatus === "READY" &&
                        r.isActive
                    )
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.roomType?.name}, Floor {r.floor})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={walkInForm.paymentMethod}
                    onChange={(e) => setWalkInForm({ ...walkInForm, paymentMethod: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="NETBANKING">Netbanking</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid / Advance Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={walkInForm.paidAmount}
                    onChange={(e) => setWalkInForm({ ...walkInForm, paidAmount: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoCheckIn"
                  checked={walkInForm.autoCheckIn}
                  onChange={(e) => setWalkInForm({ ...walkInForm, autoCheckIn: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <label htmlFor="autoCheckIn" className="text-xs font-bold text-slate-800">
                  Instant Check-In (Set room status to OCCUPIED immediately)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkIn || !walkInForm.physicalRoomId}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {submittingWalkIn ? "Creating Walk-In..." : "Confirm & Check In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
