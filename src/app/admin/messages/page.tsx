"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    setLoading(true);
    adminFetch("/api/contact")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setMessages(d.messages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await adminFetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error("Update message status error:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
            Guest Inquiries Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            View, reply to, and resolve public website contact form submissions.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-100 text-xs flex items-center gap-2 cursor-pointer self-start font-semibold"
        >
          <RefreshCw className={`h-4 w-4 text-slate-700 ${loading ? "animate-spin" : ""}`} /> Refresh Inbox
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-amber-500/20 text-slate-700 uppercase tracking-widest text-[10px] font-bold">
                <th className="py-3.5 px-4">Sender</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Message Payload</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 text-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-700 font-bold">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading inbox messages...
                  </td>
                </tr>
              ) : messages.length > 0 ? (
                messages.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-100 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">{m.name}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-900 font-bold">{m.email}</div>
                      <div className="text-[10px] text-slate-500/70">{m.phone || "-"}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm text-slate-900 leading-relaxed text-[11px] font-medium">{m.message}</td>
                    <td className="py-3.5 px-4 text-[10px] text-slate-500/70 font-mono">{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                        m.status === "RESOLVED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : m.status === "READ"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => updateStatus(m.id, "RESOLVED")}
                        className="px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No contact form submissions recorded yet.
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
