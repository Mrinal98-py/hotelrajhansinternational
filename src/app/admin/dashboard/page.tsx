"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  UserCheck,
  UserMinus,
  Percent,
  BedDouble,
  Clock,
  ArrowUpRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { adminFetch } from "@/lib/admin-fetch";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    adminFetch("/api/reports")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setData(d);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-sync dashboard metrics when window is focused
    window.addEventListener("focus", fetchDashboardData);
    return () => window.removeEventListener("focus", fetchDashboardData);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-900 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-900" />
        <p className="text-xs uppercase tracking-widest font-extrabold text-slate-900">Loading Dashboard...</p>
      </div>
    );
  }

  const { metrics, revenueTrend, recentBookings } = data;

  const cards = [
    {
      title: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString("en-IN")}`,
      subtitle: "Lifetime verified earnings",
      icon: DollarSign,
      accent: "text-slate-900",
    },
    {
      title: "Today's Check-Ins",
      value: metrics.todaysCheckInsCount,
      subtitle: "Guests arriving today",
      icon: UserCheck,
      accent: "text-emerald-800",
    },
    {
      title: "Today's Check-Outs",
      value: metrics.todaysCheckOutsCount,
      subtitle: "Guests departing today",
      icon: UserMinus,
      accent: "text-sky-800",
    },
    {
      title: "Occupancy Rate",
      value: `${metrics.occupancyRate}%`,
      subtitle: `${metrics.occupiedRooms} of ${metrics.totalRooms} rooms occupied`,
      icon: Percent,
      accent: "text-violet-800",
    },
    {
      title: "Available Rooms",
      value: metrics.availableRooms,
      subtitle: `Out of ${metrics.totalRooms} total rooms`,
      icon: BedDouble,
      accent: "text-teal-800",
    },
    {
      title: "Pending Payments",
      value: `₹${metrics.pendingPayments.toLocaleString("en-IN")}`,
      subtitle: "Awaiting confirmation",
      icon: Clock,
      accent: "text-rose-800",
    },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Operations Overview
          </h1>
          <p className="text-sm text-slate-700 mt-1 font-semibold">
            Quick view of occupancy, revenue, and reservations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className="h-4 w-4 text-slate-900" /> Refresh
          </button>
          <Link
            href="/admin/bookings"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            Manage Bookings <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-extrabold text-slate-900">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg bg-slate-100 ${card.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              <p className="text-sm text-slate-700 font-semibold">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
          <p className="text-sm text-slate-700 font-semibold">Monthly gross income stream in INR</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" stroke="#0f172a" fontSize={12} fontWeight={700} />
              <YAxis stroke="#0f172a" fontSize={12} fontWeight={700} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderColor: "#0f172a", color: "#0f172a", borderRadius: "10px", fontWeight: "bold" }}
                formatter={(value: any) => [`₹${value}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Recent Reservations</h3>
          <Link href="/admin/bookings" className="text-xs text-slate-900 hover:text-black uppercase tracking-widest font-extrabold">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-900 uppercase tracking-widest text-[10px] font-extrabold">
                <th className="py-3.5 px-4 text-slate-900">Booking Ref</th>
                <th className="py-3.5 px-4 text-slate-900">Guest</th>
                <th className="py-3.5 px-4 text-slate-900">Room</th>
                <th className="py-3.5 px-4 text-slate-900">Check-In / Out</th>
                <th className="py-3.5 px-4 text-slate-900">Amount</th>
                <th className="py-3.5 px-4 text-slate-900">Status</th>
                <th className="py-3.5 px-4 text-right text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((b: any) => (
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
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">₹{b.netAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase font-extrabold tracking-wider border ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : b.status === "CHECKED_IN"
                            ? "bg-sky-100 text-sky-900 border-sky-300"
                            : b.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-900 border-rose-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/invoice/${b.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-900"
                        title="View Tax Invoice"
                      >
                        <FileText className="h-4 w-4 text-slate-900" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-900 text-xs font-semibold">
                    No reservations recorded yet.
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
