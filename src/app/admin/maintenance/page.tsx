"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { formatDate } from "@/lib/utils";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  X,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [rooms, setRooms] = useState<any[]>([]);

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    category: "ELECTRICAL",
    priority: "MEDIUM",
    physicalRoomId: "",
    blocksRoom: false,
    estimatedCost: "",
    assignedTo: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Banner
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [tRes, rRes] = await Promise.all([
        adminFetch("/api/maintenance"),
        adminFetch("/api/rooms/inventory"),
      ]);

      const [tData, rData] = await Promise.all([tRes.json(), rRes.json()]);

      if (tData.success) {
        setTickets(tData.data.tickets || []);
        setMetrics(tData.data.metrics || {});
      }
      if (rData.success) {
        setRooms(rData.data.physicalRooms || []);
      }
    } catch (err: any) {
      setBanner({ type: "error", text: "Failed to load maintenance records" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.description) return;

    try {
      setSubmitting(true);
      const res = await adminFetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_TICKET",
          ...ticketForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBanner({ type: "success", text: "Maintenance ticket created successfully" });
        setShowModal(false);
        setTicketForm({
          title: "",
          description: "",
          category: "ELECTRICAL",
          priority: "MEDIUM",
          physicalRoomId: "",
          blocksRoom: false,
          estimatedCost: "",
          assignedTo: "",
          notes: "",
        });
        fetchData();
      } else {
        setBanner({ type: "error", text: data.error?.message || "Failed to create ticket" });
      }
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Failed to create ticket" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const res = await adminFetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_TICKET",
          ticketId,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBanner({ type: "success", text: `Ticket marked as ${status}` });
        fetchData();
      } else {
        setBanner({ type: "error", text: data.error?.message || "Failed to update ticket" });
      }
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Failed to update ticket" });
    }
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{banner.text}</span>
          </div>
          <button onClick={() => setBanner(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Total Tickets</span>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-2">{metrics.totalTickets ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Recorded Issues</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Open Tickets</span>
          <p className="text-2xl font-bold font-serif text-amber-600 mt-2">{metrics.openTickets ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Pending Action</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Critical Priority</span>
          <p className="text-2xl font-bold font-serif text-red-600 mt-2">{metrics.criticalTickets ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Urgent Intervention</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Blocked Rooms</span>
          <p className="text-2xl font-bold font-serif text-purple-600 mt-2">{metrics.blockingRooms ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Out of Order for Guests</p>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-500" /> Maintenance & Engineering Tickets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track equipment repairs, civil works, and room availability blockages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Log Maintenance Ticket
          </button>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No maintenance tickets recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Ticket & Date</th>
                  <th className="py-3 px-4">Affected Room</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority & Blockage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{ticket.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatDate(ticket.createdAt)} • By {ticket.reportedBy}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">{ticket.description}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {ticket.physicalRoom ? (
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                          Room {ticket.physicalRoom.roomNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">General Facility</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {ticket.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                            ticket.priority === "CRITICAL"
                              ? "bg-red-600 text-white"
                              : ticket.priority === "HIGH"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ticket.priority}
                        </span>

                        {ticket.blocksRoom && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-mono uppercase">
                            Room Blocked
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : ticket.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ticket.status === "OPEN" && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, "IN_PROGRESS")}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Start Work
                          </button>
                        )}

                        {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, "RESOLVED")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Resolve & Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-base font-bold text-slate-900">Log Maintenance Ticket</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC compressor failure, leaking tap"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  required
                  placeholder="Describe fault, symptoms, parts needed..."
                  rows={2}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="HVAC">HVAC / Air Conditioning</option>
                    <option value="FURNITURE">Furniture / Carpentry</option>
                    <option value="APPLIANCE">Appliance / TV</option>
                    <option value="CIVIL">Civil / Painting</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical (Auto-Block)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Physical Room</label>
                <select
                  value={ticketForm.physicalRoomId}
                  onChange={(e) => setTicketForm({ ...ticketForm, physicalRoomId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="">-- General / Common Area (No Room) --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} (Floor {r.floor} • {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="blocksRoom"
                  checked={ticketForm.blocksRoom || ticketForm.priority === "CRITICAL"}
                  onChange={(e) => setTicketForm({ ...ticketForm, blocksRoom: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <label htmlFor="blocksRoom" className="font-bold text-slate-800">
                  Block Room for Booking (Set status to MAINTENANCE)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Logging Ticket..." : "Log Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
