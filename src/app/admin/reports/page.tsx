"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  Percent,
  Calendar,
  CreditCard,
  BedDouble,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Parser } from "json2csv";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("THIS_MONTH");
  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");

  const fetchReports = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      range: timeRange,
      roomType: roomTypeFilter,
    });
    adminFetch(`/api/reports?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d.data || d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRange, roomTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const exportCSV = () => {
    if (!data || !data.recentBookings) return;
    const exportData = data.recentBookings.map((b: any) => ({
      Booking_Reference: b.referenceId,
      Guest_Name: b.customer?.name,
      Phone: b.customer?.phone,
      Room: b.room?.name,
      CheckIn: new Date(b.checkIn).toISOString().split("T")[0],
      CheckOut: new Date(b.checkOut).toISOString().split("T")[0],
      Gross_Amount: b.totalAmount,
      Tax_Amount: b.taxAmount,
      Discount_Amount: b.discountAmount,
      Net_Amount: b.netAmount,
      Paid_Amount: b.paidAmount,
      Status: b.status,
    }));

    try {
      const csv = new Parser().parse(exportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rajhans_Hotel_Report_${timeRange}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("CSV Export error:", e);
    }
  };

  const ranges = [
    { label: "Today", value: "TODAY" },
    { label: "Yesterday", value: "YESTERDAY" },
    { label: "This Week", value: "THIS_WEEK" },
    { label: "This Month", value: "THIS_MONTH" },
    { label: "Last Month", value: "LAST_MONTH" },
    { label: "Lifetime", value: "ALL" },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Hotel Analytics & Financial KPIs
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Real PostgreSQL authoritative revenue, ADR, RevPAR, and occupancy audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={exportCSV}
            disabled={!data || !data.recentBookings}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">Range:</span>
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === r.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Category:</span>
          <select
            value={roomTypeFilter}
            onChange={(e) => setRoomTypeFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">All Categories</option>
            <option value="DELUXE">Deluxe</option>
            <option value="EXECUTIVE">Executive</option>
            <option value="SUITE">Suite</option>
            <option value="DORMITORY">Dormitory</option>
          </select>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-900 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-900" />
          <p className="text-xs uppercase tracking-widest font-extrabold text-slate-900">
            Calculating Performance Indices...
          </p>
        </div>
      ) : data ? (
        <>
          {/* Key Hotel Performance Indicators (ADR, RevPAR, Occupancy, ALOS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
                  Occupancy Rate
                </span>
                <Percent className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{data.kpis?.occupancyRate ?? 0}%</div>
              <p className="text-xs text-slate-600 font-medium">
                {data.inventory?.occupiedPhysicalRooms ?? 0} occupied / {data.inventory?.totalPhysicalRooms ?? 16} rooms
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
                  ADR (Avg Daily Rate)
                </span>
                <DollarSign className="h-4 w-4 text-sky-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₹{(data.kpis?.adr ?? 0).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-600 font-medium">Net room revenue per occupied night</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
                  RevPAR (Rev Per Available Room)
                </span>
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ₹{(data.kpis?.revPar ?? 0).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-600 font-medium">Total room revenue / total capacity</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
                  Avg Stay (ALOS)
                </span>
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {data.kpis?.averageLengthOfStay ?? 0} <span className="text-base font-normal text-slate-500">nights</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Cancellation: {data.kpis?.cancellationRate ?? 0}% | No-show: {data.kpis?.noShowRate ?? 0}%
              </p>
            </div>
          </div>

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial Overview Card */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Revenue & Accounting Breakdown</h3>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                  {timeRange.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs font-bold text-slate-500">Gross Room Charges</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    ₹{(data.financials?.grossRevenue ?? 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs font-bold text-slate-500">Taxes Collected</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    ₹{(data.financials?.totalTaxes ?? 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs font-bold text-slate-500">Discounts Applied</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    -₹{(data.financials?.totalDiscounts ?? 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs font-bold text-slate-500">Net Billed Revenue</div>
                  <div className="text-lg font-bold text-emerald-700 mt-1">
                    ₹{(data.financials?.netRevenue ?? 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-700">
                <div>
                  Settled Payments:{" "}
                  <span className="text-emerald-700 font-extrabold">
                    ₹{(data.financials?.totalPaid ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  Total Refunds Issued:{" "}
                  <span className="text-rose-700 font-extrabold">
                    ₹{(data.financials?.totalRefunds ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  Outstanding Balance:{" "}
                  <span className="text-amber-700 font-extrabold">
                    ₹{(data.financials?.outstandingBalance ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Payment Collection Channels</h3>
              <div className="space-y-3">
                {Object.entries(data.financials?.paymentMethods ?? {}).map(([method, amount]: [string, any]) => (
                  <div key={method} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-xs font-bold uppercase text-slate-700">{method}</span>
                    <span className="text-sm font-bold text-slate-900">₹{(amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-xs text-slate-500 font-medium">
                Verified against Cashfree webhooks and front desk cashier shifts.
              </div>
            </div>
          </div>

          {/* Detailed Reservation Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Filtered Reservation Audits</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-3">Ref ID</th>
                    <th className="py-3 px-3">Guest</th>
                    <th className="py-3 px-3">Room Type</th>
                    <th className="py-3 px-3">Check-In</th>
                    <th className="py-3 px-3">Check-Out</th>
                    <th className="py-3 px-3">Net Bill</th>
                    <th className="py-3 px-3">Paid</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentBookings && data.recentBookings.length > 0 ? (
                    data.recentBookings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.referenceId}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{b.customer?.name}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{b.room?.name}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {new Date(b.checkIn).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {new Date(b.checkOut).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          ₹{b.netAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          ₹{b.paidAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              b.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "CHECKED_IN"
                                ? "bg-sky-100 text-sky-800"
                                : b.status === "CHECKED_OUT"
                                ? "bg-slate-200 text-slate-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                        No reservations found for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
