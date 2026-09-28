"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Receipt,
  Search,
  Plus,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  RefreshCw,
  X,
  Printer,
  ChevronRight,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminFoliosPage() {
  const [folios, setFolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedFolio, setSelectedFolio] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Modals
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [chargeData, setChargeData] = useState({
    itemType: "ROOM_SERVICE",
    description: "",
    quantity: 1,
    unitPrice: "",
    taxRate: 12,
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "CASH",
    referenceId: "",
  });

  const loadFolios = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "ALL") params.set("status", statusFilter);

    adminFetch(`/api/folios?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFolios(data.data.folios || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    loadFolios();
  }, [loadFolios]);

  const viewFolioDetails = async (folioId: string) => {
    setDetailsLoading(true);
    try {
      const res = await adminFetch(`/api/folios/${folioId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedFolio(data.data.folio);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolio) return;
    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/folios/${selectedFolio.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: chargeData.itemType,
          description: chargeData.description,
          quantity: Number(chargeData.quantity),
          unitPrice: Number(chargeData.unitPrice),
          taxRate: Number(chargeData.taxRate),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddCharge(false);
        setChargeData({ itemType: "ROOM_SERVICE", description: "", quantity: 1, unitPrice: "", taxRate: 12 });
        await viewFolioDetails(selectedFolio.id);
        loadFolios();
      } else {
        alert(data.error?.message || "Failed to add charge");
      }
    } catch (err: any) {
      alert(err?.message || "Error adding charge");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolio) return;
    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/folios/${selectedFolio.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "PAYMENT",
          description: `Payment via ${paymentData.paymentMethod}`,
          quantity: 1,
          unitPrice: Number(paymentData.amount),
          taxRate: 0,
          paymentMethod: paymentData.paymentMethod,
          referenceId: paymentData.referenceId || `PAY-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddPayment(false);
        setPaymentData({ amount: "", paymentMethod: "CASH", referenceId: "" });
        await viewFolioDetails(selectedFolio.id);
        loadFolios();
      } else {
        alert(data.error?.message || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err?.message || "Error recording payment");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Guest Folios & Billing Ledgers
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Real-time multi-item billing, split payments, taxes, and folio settlement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadFolios}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Folio #, Booking Ref, Guest Name, Room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "OPEN", "CLOSED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Folios List & Selected Folio Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Folios List */}
        <div className={`${selectedFolio ? "lg:col-span-5" : "lg:col-span-12"} space-y-3`}>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Folios ({folios.length})
            </h2>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                <span className="text-xs font-bold">Loading folios...</span>
              </div>
            ) : folios.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                No guest folios found matching your criteria.
              </div>
            ) : (
              <div className="space-y-2">
                {folios.map((f) => {
                  const isSelected = selectedFolio?.id === f.id;
                  const roomAssigned = f.booking?.roomAssignments?.[0]?.physicalRoom?.roomNumber;
                  const balance = f.balanceAmount;

                  return (
                    <div
                      key={f.id}
                      onClick={() => viewFolioDetails(f.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-md"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold">{f.folioNumber}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                isSelected
                                  ? "bg-slate-800 text-white"
                                  : f.status === "OPEN"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {f.status}
                            </span>
                          </div>
                          <div className="text-sm font-bold mt-1">
                            {f.booking?.customer?.name || "Guest"}
                          </div>
                          <div className={`text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            Room: {roomAssigned ? `#${roomAssigned}` : f.booking?.room?.name || "Unassigned"} • Ref:{" "}
                            {f.booking?.referenceId}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-sm font-bold font-mono ${balance > 0 ? (isSelected ? "text-amber-300" : "text-amber-700") : (isSelected ? "text-emerald-300" : "text-emerald-700")}`}>
                            ₹{balance.toLocaleString("en-IN")}
                          </div>
                          <div className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
                            {balance > 0 ? "Due" : "Settled"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Folio Ledger Details */}
        {selectedFolio && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 font-mono">
                      {selectedFolio.folioNumber}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        selectedFolio.status === "OPEN"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {selectedFolio.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    Guest: <span className="text-slate-900 font-bold">{selectedFolio.booking?.customer?.name}</span> • Phone: {selectedFolio.booking?.customer?.phone}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Booking: {selectedFolio.booking?.referenceId} • Room:{" "}
                    {selectedFolio.booking?.roomAssignments?.[0]?.physicalRoom?.roomNumber || selectedFolio.booking?.room?.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFolio(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Financial Balance Summary */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Charges</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    ₹{(selectedFolio.totalCharges + selectedFolio.totalTaxes - selectedFolio.totalDiscounts).toLocaleString("en-IN")}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid</div>
                  <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                    ₹{(selectedFolio.totalPaid || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance Due</div>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${selectedFolio.balanceAmount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                    ₹{selectedFolio.balanceAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowAddCharge(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Charge
                </button>
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" /> Record Payment
                </button>
                {selectedFolio.booking?.id && (
                  <a
                    href={`/api/invoice/${selectedFolio.booking.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="h-4 w-4" /> Invoice
                  </a>
                )}
              </div>

              {/* Itemized Transactions Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Itemized Charges & Payments ({selectedFolio.items?.length || 0})
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-right">Tax</th>
                        <th className="py-2.5 px-3 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedFolio.items?.map((item: any) => {
                        const isPayment = item.itemType === "PAYMENT";
                        const isRefund = item.itemType === "REFUND";
                        const isDiscount = item.itemType === "DISCOUNT";

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-slate-500">
                              {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isPayment
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isRefund
                                    ? "bg-rose-100 text-rose-800"
                                    : isDiscount
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {item.itemType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                              {item.taxAmount > 0 ? `₹${item.taxAmount}` : "—"}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-mono font-bold ${isPayment || isDiscount ? "text-emerald-700" : "text-slate-900"}`}>
                              {isPayment ? "-" : ""}₹{item.amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Charge Modal */}
      {showAddCharge && selectedFolio && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Service / Room Charge</h3>
              <button onClick={() => setShowAddCharge(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCharge} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Charge Category</label>
                <select
                  value={chargeData.itemType}
                  onChange={(e) => setChargeData({ ...chargeData, itemType: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                >
                  <option value="ROOM_SERVICE">Room Service</option>
                  <option value="RESTAURANT">Restaurant / Food</option>
                  <option value="LAUNDRY">Laundry</option>
                  <option value="EXTRA_BED">Extra Bed</option>
                  <option value="MINIBAR">Minibar</option>
                  <option value="SERVICE">Other Service</option>
                  <option value="DISCOUNT">Special Discount</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner Platter, 2x Express Dry Cleaning"
                  value={chargeData.description}
                  onChange={(e) => setChargeData({ ...chargeData, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={chargeData.quantity}
                    onChange={(e) => setChargeData({ ...chargeData, quantity: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={chargeData.unitPrice}
                    onChange={(e) => setChargeData({ ...chargeData, unitPrice: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Tax (%)</label>
                  <input
                    type="number"
                    value={chargeData.taxRate}
                    onChange={(e) => setChargeData({ ...chargeData, taxRate: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddCharge(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Post Charge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPayment && selectedFolio && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Guest Payment</h3>
              <button onClick={() => setShowAddPayment(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Outstanding Balance</label>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                  ₹{selectedFolio.balanceAmount.toLocaleString("en-IN")}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Enter amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="NET_BANKING">Net Banking / NEFT</option>
                  <option value="CASHFREE">Cashfree Online</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Receipt / Transaction Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-123456, Card Auth Code"
                  value={paymentData.referenceId}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
