"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Database,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const loadLogs = useCallback(
    (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.set("search", search);
      if (entityFilter !== "ALL") params.set("entity", entityFilter);

      adminFetch(`/api/audit?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLogs(data.data.logs || []);
            setPagination(data.data.pagination || { total: 0, page: 1, limit: 50, totalPages: 1 });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [search, entityFilter]
  );

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  const entityTypes = [
    "ALL",
    "Booking",
    "Payment",
    "Folio",
    "CashierShift",
    "HousekeepingTask",
    "MaintenanceTicket",
    "Employee",
    "Promotion",
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Security & Operational Audit Trail
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Immutable, append-only chronological log of all sensitive transactions and staff modifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadLogs(pagination.page)}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by keyword, staff name, entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">Entity:</span>
          {entityTypes.map((et) => (
            <button
              key={et}
              onClick={() => setEntityFilter(et)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                entityFilter === et
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Logged Events: {pagination.total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadLogs(pagination.page - 1)}
              className="p-1 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadLogs(pagination.page + 1)}
              className="p-1 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details & Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-bold">Loading security logs...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {log.userName || log.userId || "System Daemon"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-900 text-white">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {log.entity} {log.entityId && <span className="font-mono text-slate-400">({log.entityId.slice(0, 8)}...)</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
