"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { Parser } from "json2csv";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    adminFetch("/api/reports")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportCSV = () => {
    if (!data || !data.recentBookings) return;
    const exportData = data.recentBookings.map((b: any) => ({
      Booking_Reference: b.referenceId,
      Guest_Name: b.customer?.name,
      Phone: b.customer?.phone,
      Room: b.room?.name,
      CheckIn: new Date(b.checkIn).toISOString().split("T")[0],
      CheckOut: new Date(b.checkOut).toISOString().split("T")[0],
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
      link.setAttribute("download", `Rajhans_Hotel_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("CSV Export error:", e);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-900 space-y-4 font-sans">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-900" />
        <p className="text-xs uppercase tracking-widest font-mono font-bold text-slate-900">Generating Analytical Reports...</p>
      </div>
    );
  }

  const { metrics } = data;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
            Financial & Occupancy Reports
          </h1>
          <p className="text-xs text-slate-700 mt-1 font-semibold">
            Export booking logs, tax summaries, and monthly performance statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-800 font-bold">Total Lifetime Revenue</span>
          <div className="text-3xl font-serif font-bold text-slate-900">₹{metrics.totalRevenue.toLocaleString()}</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-800 font-bold">Pending Receivables</span>
          <div className="text-3xl font-serif font-bold text-slate-900">₹{metrics.pendingPayments.toLocaleString()}</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-800 font-bold">Current Occupancy Rate</span>
          <div className="text-3xl font-serif font-bold text-emerald-800">{metrics.occupancyRate}%</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-800 font-bold">Total Registered Rooms</span>
          <div className="text-3xl font-serif font-bold text-slate-900">{metrics.totalRooms} Rooms</div>
        </div>
      </div>

      {/* Detailed Reservation Report Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
        <h3 className="font-serif text-xl text-slate-900 font-bold">Exportable Reservation Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-amber-500/20 text-slate-900 uppercase tracking-widest text-[10px] font-extrabold">
                <th className="py-3.5 px-4 text-slate-900">Ref ID</th>
                <th className="py-3.5 px-4 text-slate-900">Guest</th>
                <th className="py-3.5 px-4 text-slate-900">Room</th>
                <th className="py-3.5 px-4 text-slate-900">Check-In</th>
                <th className="py-3.5 px-4 text-slate-900">Check-Out</th>
                <th className="py-3.5 px-4 text-slate-900">Net Amount</th>
                <th className="py-3.5 px-4 text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 text-slate-900">
              {data.recentBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-100 transition-colors text-slate-900 font-medium">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.referenceId}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.customer?.name}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-semibold">{b.room?.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-900">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-900">{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">₹{b.netAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] uppercase font-extrabold text-slate-900">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
