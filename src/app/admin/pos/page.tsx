"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Clock,
  RefreshCw,
  ShoppingBag,
  BedDouble,
  DollarSign,
  ChevronRight,
  Filter,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminPOSPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Active Category tab
  const [selectedCatId, setSelectedCatId] = useState<string>("ALL");

  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  const [orderDestination, setOrderDestination] = useState<"DINE_IN" | "ROOM">("ROOM");
  const [tableNumber, setTableNumber] = useState("T-1");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [paymentType, setPaymentType] = useState<"CHARGE_TO_ROOM" | "PAID_NOW">("CHARGE_TO_ROOM");

  // Orders tab filter
  const [orderFilter, setOrderFilter] = useState("ALL");

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminFetch("/api/restaurant").then((r) => r.json()),
      adminFetch("/api/bookings?status=CHECKED_IN&limit=50").then((r) => r.json()),
    ])
      .then(([restData, bookData]) => {
        if (restData.success) {
          setCategories(restData.data.categories || []);
          setOrders(restData.data.orders || []);
        }
        if (bookData.success) {
          setActiveBookings(bookData.data.bookings || []);
          if (bookData.data.bookings?.length > 0 && !selectedBookingId) {
            setSelectedBookingId(bookData.data.bookings[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBookingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cart operations
  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) => (i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (orderDestination === "ROOM" && !selectedBookingId) {
      alert("Please select an in-house guest room to charge.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminFetch("/api/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: orderDestination === "DINE_IN" ? tableNumber : null,
          bookingId: orderDestination === "ROOM" ? selectedBookingId : null,
          paymentType: orderDestination === "ROOM" ? paymentType : "PAID_NOW",
          items: cart,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCart([]);
        loadData();
        alert("Order sent to kitchen & posted successfully!");
      } else {
        alert(data.error?.message || "Failed to place order");
      }
    } catch (err: any) {
      alert(err?.message || "Error placing order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await adminFetch("/api/restaurant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const d = await res.json();
      if (d.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const allMenuItems = categories.flatMap((c) => c.items || []);
  const displayedItems =
    selectedCatId === "ALL"
      ? allMenuItems
      : categories.find((c) => c.id === selectedCatId)?.items || [];

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Restaurant & Kitchen POS
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Table dine-in, room service, instant folio room charges, and kitchen ticketing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Grid: Menu & Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category tabs & Menu Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCatId("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCatId === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              All Items ({allMenuItems.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCatId === c.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {c.name} ({c.items?.length || 0})
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin mb-2" />
              <span className="text-xs font-bold">Loading restaurant menu...</span>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-semibold">
              No menu items available in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {displayedItems.map((item: any) => {
                const inCart = cart.find((c) => c.menuItemId === item.id);
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {item.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold">{inCart.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add to Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Cart & Order Placement (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-slate-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Current Order ({cart.length})
                </h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Destination Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderDestination("ROOM")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  orderDestination === "ROOM"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <BedDouble className="h-3.5 w-3.5" /> Room Service
              </button>
              <button
                type="button"
                onClick={() => setOrderDestination("DINE_IN")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  orderDestination === "DINE_IN"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <UtensilsCrossed className="h-3.5 w-3.5" /> Dine-In Table
              </button>
            </div>

            {/* Destination Specific Input */}
            {orderDestination === "ROOM" ? (
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Select In-House Room / Guest
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {activeBookings.map((b) => {
                      const roomNo = b.roomAssignments?.[0]?.physicalRoom?.roomNumber;
                      return (
                        <option key={b.id} value={b.id}>
                          {roomNo ? `Room #${roomNo}` : b.room?.name} — {b.customer?.name} ({b.referenceId})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Billing Mode
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentType("CHARGE_TO_ROOM")}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center cursor-pointer ${
                        paymentType === "CHARGE_TO_ROOM"
                          ? "bg-emerald-700 text-white"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      Charge to Folio
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType("PAID_NOW")}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center cursor-pointer ${
                        paymentType === "PAID_NOW"
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      Pay Now (Cash)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Table Identifier
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-1, Outdoor Patio 4"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                  No items in order ticket. Click items on the left to add.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="p-1 text-slate-400 hover:text-rose-600 ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Price Calculation */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (5% Restaurant):</span>
                  <span className="font-mono font-bold">₹{cartTax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="font-mono text-base text-slate-900">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={actionLoading}
                  className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Submitting to Kitchen..." : "Fire Order to Kitchen"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Kitchen & Restaurant Orders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Kitchen Display & Orders Track</h3>
            <p className="text-xs text-slate-600">Live lifecycle updates for restaurant and room-service trays.</p>
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "PREPARING", "READY", "DELIVERED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  orderFilter === st
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Target</th>
                <th className="py-3 px-3">Items Summary</th>
                <th className="py-3 px-3">Billing</th>
                <th className="py-3 px-3 text-right">Net Bill</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders
                .filter((o) => (orderFilter === "ALL" ? true : o.status === orderFilter))
                .map((o) => {
                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {new Date(o.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {o.tableNumber ? `Table ${o.tableNumber}` : `Room Service (${o.booking?.customer?.name || "Guest"})`}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {o.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(", ")}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            o.paymentType === "CHARGE_TO_ROOM"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {o.paymentType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{o.netAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            o.status === "PREPARING"
                              ? "bg-amber-100 text-amber-800"
                              : o.status === "READY"
                              ? "bg-sky-100 text-sky-800"
                              : o.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {o.status === "PREPARING" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, "READY")}
                              className="px-2 py-1 bg-sky-700 text-white rounded-lg text-[10px] font-bold"
                            >
                              Mark Ready
                            </button>
                          )}
                          {o.status === "READY" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, "DELIVERED")}
                              className="px-2 py-1 bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                            >
                              Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
