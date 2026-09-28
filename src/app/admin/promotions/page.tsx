"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Search,
  DollarSign,
  AlertCircle,
  X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [promoForm, setPromoForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    minSpend: "2000",
    maxDiscount: "1000",
    usageLimit: "100",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  const loadPromotions = useCallback(() => {
    setLoading(true);
    adminFetch("/api/promotions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPromotions(data.data.promotions || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_ADMIN",
          code: promoForm.code,
          description: promoForm.description,
          discountType: promoForm.discountType,
          discountValue: Number(promoForm.discountValue),
          minSpend: Number(promoForm.minSpend || 0),
          maxDiscount: promoForm.maxDiscount ? Number(promoForm.maxDiscount) : null,
          usageLimit: Number(promoForm.usageLimit || 100),
          validFrom: promoForm.validFrom || null,
          validUntil: promoForm.validUntil || null,
          isActive: promoForm.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setPromoForm({
          code: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: "10",
          minSpend: "2000",
          maxDiscount: "1000",
          usageLimit: "100",
          validFrom: "",
          validUntil: "",
          isActive: true,
        });
        loadPromotions();
      } else {
        alert(data.error?.message || "Failed to save promotion");
      }
    } catch (err: any) {
      alert(err?.message || "Error saving promotion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion code?")) return;
    try {
      const res = await adminFetch(`/api/promotions?id=${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        loadPromotions();
      } else {
        alert(d.error?.message || "Failed to delete promotion");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPromos = promotions.filter((p) => {
    return (
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Promotions & Special Rate Plans
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Manage seasonal discount coupons, corporate rate plans, and booking promo codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPromotions}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search coupon codes or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Promotions Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-500">
          <RefreshCw className="h-8 w-8 animate-spin mb-2" />
          <span className="text-xs font-bold">Loading promotional rules...</span>
        </div>
      ) : filteredPromos.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-semibold">
          No promotional campaigns configured. Click &quot;Create Coupon&quot; to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromos.map((promo) => {
            const isPercentage = promo.discountType === "PERCENTAGE";
            const isExpired = promo.validUntil && new Date(promo.validUntil) < new Date();

            return (
              <div
                key={promo.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                      {promo.code}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isExpired
                          ? "bg-rose-100 text-rose-800"
                          : promo.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isExpired ? "EXPIRED" : promo.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-2">{promo.description || "General booking discount"}</p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">Discount Value:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {isPercentage ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} FLAT OFF`}
                      </span>
                    </div>
                    {promo.minSpend > 0 && (
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-500">Min Booking Spend:</span>
                        <span className="font-mono text-slate-700">₹{promo.minSpend.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {promo.maxDiscount && (
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-500">Max Discount Cap:</span>
                        <span className="font-mono text-slate-700">₹{promo.maxDiscount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">Redemptions:</span>
                      <span className="font-mono text-slate-700">
                        {promo.usedCount} / {promo.usageLimit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500">
                    {promo.validUntil
                      ? `Expires: ${new Date(promo.validUntil).toLocaleDateString("en-IN")}`
                      : "No expiration"}
                  </span>
                  <button
                    onClick={() => handleDeletePromotion(promo.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Promotion Coupon</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromotion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAJHANS20"
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Discount Type</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend getaway 15% discount"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Min Spend (₹)</label>
                  <input
                    type="number"
                    value={promoForm.minSpend}
                    onChange={(e) => setPromoForm({ ...promoForm, minSpend: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={promoForm.maxDiscount}
                    onChange={(e) => setPromoForm({ ...promoForm, maxDiscount: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Valid Until</label>
                  <input
                    type="date"
                    value={promoForm.validUntil}
                    onChange={(e) => setPromoForm({ ...promoForm, validUntil: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Usage Limit</label>
                  <input
                    type="number"
                    value={promoForm.usageLimit}
                    onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
