"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  Unlock,
  DollarSign,
  FileText,
  X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminCashierPage() {
  const [data, setData] = useState<any>({ drawers: [], shifts: [], activeShift: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [selectedShiftForView, setSelectedShiftForView] = useState<any>(null);

  // Forms
  const [openShiftForm, setOpenShiftForm] = useState({
    drawerId: "",
    openingBalance: "5000",
    notes: "",
  });

  const [closeShiftForm, setCloseShiftForm] = useState({
    actualClosingBalance: "",
    notes: "",
  });

  const [txForm, setTxForm] = useState({
    type: "EXPENSE", // CASH_IN, CASH_OUT, EXPENSE, DROP
    amount: "",
    reason: "",
  });

  const loadData = useCallback(() => {
    setLoading(true);
    adminFetch("/api/cashier/shifts")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
          if (resData.data.drawers?.length > 0 && !openShiftForm.drawerId) {
            setOpenShiftForm((prev) => ({ ...prev, drawerId: resData.data.drawers[0].id }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [openShiftForm.drawerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/cashier/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "OPEN_SHIFT",
          drawerId: openShiftForm.drawerId,
          openingBalance: Number(openShiftForm.openingBalance),
          notes: openShiftForm.notes,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowOpenShift(false);
        loadData();
      } else {
        alert(d.error?.message || "Failed to open shift");
      }
    } catch (err: any) {
      alert(err?.message || "Error opening shift");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.activeShift) return;
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/cashier/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CLOSE_SHIFT",
          shiftId: data.activeShift.id,
          actualClosingBalance: Number(closeShiftForm.actualClosingBalance),
          notes: closeShiftForm.notes,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowCloseShift(false);
        setCloseShiftForm({ actualClosingBalance: "", notes: "" });
        loadData();
      } else {
        alert(d.error?.message || "Failed to close shift");
      }
    } catch (err: any) {
      alert(err?.message || "Error closing shift");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.activeShift) return;
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/cashier/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_TRANSACTION",
          shiftId: data.activeShift.id,
          type: txForm.type,
          amount: Number(txForm.amount),
          reason: txForm.reason,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowAddTx(false);
        setTxForm({ type: "EXPENSE", amount: "", reason: "" });
        loadData();
      } else {
        alert(d.error?.message || "Failed to add cash movement");
      }
    } catch (err: any) {
      alert(err?.message || "Error recording movement");
    } finally {
      setActionLoading(false);
    }
  };

  const activeShift = data.activeShift;

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Cashier Shifts & Cash Management
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Shift reconciliation, cash drawer tracking, discrepancies, and petty expenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          {!activeShift && (
            <button
              onClick={() => setShowOpenShift(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Unlock className="h-4 w-4" /> Open New Shift
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Banner / Card */}
      {activeShift ? (
        <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Active Shift: {activeShift.drawer?.name}</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    OPEN
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cashier: <span className="font-bold text-slate-900">{activeShift.cashierName}</span> • Opened:{" "}
                  {new Date(activeShift.openedAt).toLocaleString("en-IN", {
                    hour: "numeric",
                    minute: "numeric",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddTx(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Petty Cash / Expense
              </button>
              <button
                onClick={() => {
                  setCloseShiftForm({
                    actualClosingBalance: String(activeShift.closingBalanceExpected),
                    notes: "",
                  });
                  setShowCloseShift(true);
                }}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Lock className="h-4 w-4" /> Close & Reconcile Shift
              </button>
            </div>
          </div>

          {/* Cash Ledger Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opening Float</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                ₹{activeShift.openingBalance.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Received</div>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                ₹{activeShift.totalCashReceived.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-4 bg-rose-50/50 rounded-xl">
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Refunds / Drops</div>
              <div className="text-xl font-bold font-mono text-rose-700 mt-1">
                ₹{(activeShift.totalCashRefunds + activeShift.totalCashDropped).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Expected Cash</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                ₹{activeShift.closingBalanceExpected.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Active Shift Transactions List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Shift Cash Movements ({activeShift.transactions?.length || 0})
            </h3>
            {activeShift.transactions && activeShift.transactions.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Reason / Folio</th>
                      <th className="py-2.5 px-3">Staff</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeShift.transactions.map((tx: any) => {
                      const isPositive = tx.type === "CASH_IN" || tx.type === "PAYMENT_RECEIVED";
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {new Date(tx.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isPositive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-900 font-medium">{tx.reason}</td>
                          <td className="py-2.5 px-3 text-slate-600">{tx.recordedBy}</td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                            {isPositive ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 font-semibold bg-slate-50 rounded-xl">
                No cash transactions recorded during this shift yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">No Cashier Shift Currently Active</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Reception staff must open a shift and record starting float before processing cash walk-in payments or petty expenses.
          </p>
          <button
            onClick={() => setShowOpenShift(true)}
            className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm cursor-pointer"
          >
            Open Front Desk Shift
          </button>
        </div>
      )}

      {/* Historical Shifts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Historical Shifts & Reconciliation Audits</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-3">Drawer</th>
                <th className="py-3 px-3">Cashier</th>
                <th className="py-3 px-3">Opened</th>
                <th className="py-3 px-3">Closed</th>
                <th className="py-3 px-3 text-right">Expected</th>
                <th className="py-3 px-3 text-right">Actual</th>
                <th className="py-3 px-3 text-right">Discrepancy</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.shifts?.map((s: any) => {
                const diff = s.discrepancy || 0;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{s.drawer?.name}</td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{s.cashierName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {new Date(s.openedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {s.closedAt
                        ? new Date(s.closedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{s.closingBalanceExpected.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {s.closingBalanceActual !== null ? `₹${s.closingBalanceActual.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {s.closedAt ? (
                        <span
                          className={
                            diff === 0
                              ? "text-emerald-700"
                              : diff < 0
                              ? "text-rose-700 font-extrabold"
                              : "text-amber-700 font-extrabold"
                          }
                        >
                          {diff > 0 ? `+₹${diff}` : diff < 0 ? `-₹${Math.abs(diff)}` : "₹0 (Balanced)"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          s.status === "OPEN"
                            ? "bg-emerald-100 text-emerald-800"
                            : s.status === "CLOSED"
                            ? "bg-slate-200 text-slate-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Shift Modal */}
      {showOpenShift && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Open Cashier Shift</h3>
              <button onClick={() => setShowOpenShift(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Select Physical Cash Drawer</label>
                <select
                  value={openShiftForm.drawerId}
                  onChange={(e) => setOpenShiftForm({ ...openShiftForm, drawerId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  required
                >
                  {data.drawers?.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.identifier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Opening Cash Float (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openShiftForm.openingBalance}
                  onChange={(e) => setOpenShiftForm({ ...openShiftForm, openingBalance: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[11px] text-slate-500 font-medium">Count physical cash in drawer before starting.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Notes / Handover Reference</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Received from Morning Shift reception..."
                  value={openShiftForm.notes}
                  onChange={(e) => setOpenShiftForm({ ...openShiftForm, notes: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowOpenShift(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? "Opening..." : "Confirm & Start Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showCloseShift && activeShift && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Close & Reconcile Shift</h3>
              <button onClick={() => setShowCloseShift(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Expected Physical Cash:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{activeShift.closingBalanceExpected.toLocaleString("en-IN")}
                  </span>
                </div>
                {closeShiftForm.actualClosingBalance !== "" && (
                  <div className="flex justify-between text-xs font-semibold pt-1 border-t border-slate-200">
                    <span className="text-slate-600">Live Discrepancy:</span>
                    <span
                      className={`font-mono font-bold ${
                        Number(closeShiftForm.actualClosingBalance) - activeShift.closingBalanceExpected === 0
                          ? "text-emerald-700"
                          : Number(closeShiftForm.actualClosingBalance) - activeShift.closingBalanceExpected < 0
                          ? "text-rose-700"
                          : "text-amber-700"
                      }`}
                    >
                      {Number(closeShiftForm.actualClosingBalance) - activeShift.closingBalanceExpected >= 0 ? "+" : ""}
                      ₹{(Number(closeShiftForm.actualClosingBalance) - activeShift.closingBalanceExpected).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Actual Cash Counted in Drawer (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Enter physical cash total"
                  value={closeShiftForm.actualClosingBalance}
                  onChange={(e) => setCloseShiftForm({ ...closeShiftForm, actualClosingBalance: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Closing Reconciliation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Explain any discrepancy or cash drop..."
                  value={closeShiftForm.notes}
                  onChange={(e) => setCloseShiftForm({ ...closeShiftForm, notes: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCloseShift(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? "Closing..." : "Finalize & Reconcile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cash Transaction / Petty Cash Modal */}
      {showAddTx && activeShift && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Cash Movement</h3>
              <button onClick={() => setShowAddTx(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTx} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Movement Category</label>
                <select
                  value={txForm.type}
                  onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                >
                  <option value="EXPENSE">Petty Cash Expense (Outflow)</option>
                  <option value="DROP">Cash Drop / Safe Transfer (Outflow)</option>
                  <option value="CASH_IN">Cash Inflow / Float Addition (Inflow)</option>
                  <option value="CASH_OUT">Other Cash Outflow</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Reason / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milk purchase, Taxi fare for guest, Safe drop"
                  value={txForm.reason}
                  onChange={(e) => setTxForm({ ...txForm, reason: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? "Recording..." : "Record Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
