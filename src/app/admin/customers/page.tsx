"use client";

import { useEffect, useState } from "react";
import { Search, Star, Edit, RefreshCw, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const fetchCustomers = () => {
    setLoading(true);
    const query = search ? `?search=${search}` : "";
    adminFetch(`/api/customers${query}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setCustomers(d.data?.customers || d.customers || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCustomer),
      });
      const data = await res.json();
      if (data.success && data.customer) {
        setCustomers((prev) => prev.map((c: any) => (c.id === data.customer.id ? data.customer : c)));
        setEditingCustomer(null);
        fetchCustomers();
      }
    } catch (err) {
      console.error("Save customer error:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900">
            Guest CRM & Profiles
          </h1>
          <p className="text-sm text-slate-700 mt-1 font-semibold">
            Track stay histories, lifetime revenue, VIP badges, and guest preferences.
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs flex items-center gap-2 cursor-pointer self-start font-bold"
        >
          <RefreshCw className={`h-4 w-4 text-slate-900 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search by Guest Name, Phone, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-400 font-semibold"
          />
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-900 uppercase tracking-widest text-[10px] font-extrabold">
                <th className="py-3.5 px-4 text-slate-900">Guest Name</th>
                <th className="py-3.5 px-4 text-slate-900">Contact Info</th>
                <th className="py-3.5 px-4 text-slate-900">Stays</th>
                <th className="py-3.5 px-4 text-slate-900">Total Spent</th>
                <th className="py-3.5 px-4 text-slate-900">VIP Status</th>
                <th className="py-3.5 px-4 text-slate-900">Internal Notes</th>
                <th className="py-3.5 px-4 text-right text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-900 font-bold">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-900" />
                    Loading guest records...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-100 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{c.name}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-900 font-bold">{c.phone}</div>
                      <div className="text-slate-700 font-semibold text-[10px]">{c.email || "-"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{c.visitCount} visit(s)</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">₹{c.totalSpent.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      {c.vipStatus ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-600" /> VIP Guest
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-700 font-mono font-bold">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-800 font-medium">{c.notes || "-"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEditingCustomer({ ...c })}
                        className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-900 cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5 text-slate-900" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-900 text-xs font-semibold">
                    No guest profiles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-slate-900">
            <button onClick={() => setEditingCustomer(null)} className="absolute top-4 right-4 p-2 text-slate-700 hover:text-slate-900">
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-serif text-xl text-slate-900 font-bold">Edit Guest Profile</h2>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-900 font-bold mb-1">Guest Name</label>
                <input
                  type="text"
                  disabled
                  value={editingCustomer.name}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-900 font-bold mb-1">Address</label>
                <input
                  type="text"
                  value={editingCustomer.address || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-900 font-bold mb-1">ID Proof Number</label>
                <input
                  type="text"
                  value={editingCustomer.idProofNumber || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, idProofNumber: e.target.value })}
                  placeholder="Aadhaar / Passport / Driving License"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="vipToggle"
                  checked={editingCustomer.vipStatus || false}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, vipStatus: e.target.checked })}
                  className="rounded accent-slate-900 h-4 w-4"
                />
                <label htmlFor="vipToggle" className="text-xs uppercase font-bold tracking-wider text-slate-900 cursor-pointer">
                  Mark as VIP Guest
                </label>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-900 font-bold mb-1">Internal Notes</label>
                <textarea
                  rows={3}
                  value={editingCustomer.notes || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  placeholder="Preferences, allergies, special treatment notes..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 resize-none font-semibold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button type="button" onClick={() => setEditingCustomer(null)} className="px-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-sm cursor-pointer hover:bg-slate-800">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
