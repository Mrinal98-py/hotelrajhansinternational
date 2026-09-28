"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Grid3X3,
  BedDouble,
  Sparkles,
  Wrench,
  Plus,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function RoomInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [physicalRooms, setPhysicalRooms] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [floorFilter, setFloorFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create/Edit room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [roomForm, setRoomForm] = useState({
    roomNumber: "",
    floor: 1,
    roomTypeId: "",
    status: "AVAILABLE",
    housekeepingStatus: "READY",
    notes: "",
    isActive: true,
  });
  const [savingRoom, setSavingRoom] = useState(false);

  // Status message
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [invRes, typesRes] = await Promise.all([
        adminFetch("/api/rooms/inventory"),
        adminFetch("/api/rooms"),
      ]);

      const [invData, typesData] = await Promise.all([invRes.json(), typesRes.json()]);

      if (invData.success) {
        setPhysicalRooms(invData.data.physicalRooms || []);
      }
      if (typesData.rooms) {
        setRoomTypes(typesData.rooms);
      }
    } catch (err: any) {
      setBanner({ type: "error", text: "Failed to load physical room inventory" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group rooms by Floor
  const floors = Array.from(new Set(physicalRooms.map((r) => r.floor))).sort((a, b) => a - b);

  const filteredRooms = physicalRooms.filter((r) => {
    if (floorFilter !== "ALL" && r.floor !== parseInt(floorFilter, 10)) return false;
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setRoomForm({
      roomNumber: "",
      floor: 1,
      roomTypeId: roomTypes[0]?.id || "",
      status: "AVAILABLE",
      housekeepingStatus: "READY",
      notes: "",
      isActive: true,
    });
    setShowRoomModal(true);
  };

  const handleOpenEdit = (r: any) => {
    setEditingRoom(r);
    setRoomForm({
      roomNumber: r.roomNumber,
      floor: r.floor,
      roomTypeId: r.roomTypeId,
      status: r.status,
      housekeepingStatus: r.housekeepingStatus,
      notes: r.notes || "",
      isActive: r.isActive,
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingRoom(true);
      const res = await adminFetch("/api/rooms/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRoom?.id,
          ...roomForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBanner({
          type: "success",
          text: `Room ${roomForm.roomNumber} ${editingRoom ? "updated" : "created"} successfully.`,
        });
        setShowRoomModal(false);
        fetchData();
      } else {
        setBanner({ type: "error", text: data.error?.message || "Failed to save physical room" });
      }
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Failed to save room" });
    } finally {
      setSavingRoom(false);
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-amber-500" /> Physical Room Inventory Grid
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physical room availability, housekeeping states, and floor management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            title="Refresh Grid"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Physical Room
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          <Filter className="h-3.5 w-3.5" /> Filters:
        </div>

        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 font-semibold"
        >
          <option value="ALL">All Floors</option>
          {floors.map((fl) => (
            <option key={fl} value={fl}>
              Floor {fl}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 font-semibold"
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="OCCUPIED">OCCUPIED</option>
          <option value="DIRTY">DIRTY</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
          <option value="OUT_OF_ORDER">OUT OF ORDER</option>
        </select>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1 text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Occupied
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Dirty
          </span>
          <span className="flex items-center gap-1 text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Maintenance
          </span>
        </div>
      </div>

      {/* Floor by Floor Layout */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading room inventory...</div>
      ) : (
        <div className="space-y-6">
          {floors.map((floorNum) => {
            const roomsOnFloor = filteredRooms.filter((r) => r.floor === floorNum);
            if (roomsOnFloor.length === 0) return null;

            return (
              <div key={floorNum} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Floor {floorNum}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {roomsOnFloor.length} Physical Room(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {roomsOnFloor.map((room) => {
                    const activeAssignment = room.assignments?.[0];
                    const activeGuest = activeAssignment?.booking?.customer;

                    const isAvailable = room.status === "AVAILABLE" && room.housekeepingStatus === "READY";
                    const isOccupied = room.status === "OCCUPIED";
                    const isDirty = room.housekeepingStatus === "DIRTY";
                    const isMaint = room.status === "MAINTENANCE" || room.status === "OUT_OF_ORDER";

                    return (
                      <div
                        key={room.id}
                        onClick={() => handleOpenEdit(room)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative hover:shadow-md ${
                          isOccupied
                            ? "bg-blue-50/70 border-blue-200 hover:border-blue-400"
                            : isDirty
                            ? "bg-amber-50/70 border-amber-200 hover:border-amber-400"
                            : isMaint
                            ? "bg-red-50/70 border-red-200 hover:border-red-400"
                            : "bg-emerald-50/70 border-emerald-200 hover:border-emerald-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-base font-bold text-slate-900">
                            {room.roomNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono ${
                              isOccupied
                                ? "bg-blue-600 text-white"
                                : isDirty
                                ? "bg-amber-600 text-white"
                                : isMaint
                                ? "bg-red-600 text-white"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            {room.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-600 font-semibold truncate mt-1">
                          {room.roomType?.name}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-medium">Housekeeping:</span>
                          <span
                            className={`font-bold ${
                              room.housekeepingStatus === "READY"
                                ? "text-emerald-700"
                                : room.housekeepingStatus === "DIRTY"
                                ? "text-amber-700"
                                : "text-blue-700"
                            }`}
                          >
                            {room.housekeepingStatus}
                          </span>
                        </div>

                        {activeGuest && (
                          <div className="mt-1.5 text-[10px] text-slate-800 bg-white/80 p-1 rounded font-semibold truncate">
                            👤 {activeGuest.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-base font-bold text-slate-900">
                {editingRoom ? `Edit Physical Room ${editingRoom.roomNumber}` : "Add New Physical Room"}
              </h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor Level *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Room Category / Type *</label>
                <select
                  required
                  value={roomForm.roomTypeId}
                  onChange={(e) => setRoomForm({ ...roomForm, roomTypeId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="">-- Choose Category --</option>
                  {roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Capacity: {t.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Status</label>
                  <select
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="DIRTY">DIRTY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OUT_OF_ORDER">OUT OF ORDER</option>
                    <option value="DEACTIVATED">DEACTIVATED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Housekeeping Status</label>
                  <select
                    value={roomForm.housekeepingStatus}
                    onChange={(e) => setRoomForm({ ...roomForm, housekeepingStatus: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="READY">READY</option>
                    <option value="DIRTY">DIRTY</option>
                    <option value="CLEANING">CLEANING</option>
                    <option value="INSPECTION">INSPECTION</option>
                    <option value="OUT_OF_ORDER">OUT OF ORDER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  placeholder="e.g. Corner room with garden view, extra wardrobe"
                  rows={2}
                  value={roomForm.notes}
                  onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingRoom ? "Saving..." : "Save Physical Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
