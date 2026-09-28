"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Sparkles,
  Lock,
  Unlock,
  BedDouble,
  User,
  Phone,
  FileText,
  DollarSign,
  Plus,
  ArrowRight,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { Parser } from "json2csv";

const MONTHS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];

function formatDateToLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminRoomInventoryCalendarPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calendar Date State (hotel local time Asia/Kolkata)
  const [baseDate, setBaseDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [viewDays, setViewDays] = useState<7 | 14 | 30>(7);

  // Filters
  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");
  const [floorFilter, setFloorFilter] = useState("ALL");
  const [searchRoom, setSearchRoom] = useState("");

  // Modals & Drawers
  const [selectedCell, setSelectedCell] = useState<{
    room: any;
    dateStr: string;
  } | null>(null);

  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Block Room Form
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    physicalRoomId: "",
    startDate: "",
    endDate: "",
    reason: "",
    blockType: "MANAGEMENT_BLOCK",
    notes: "",
  });

  // Reassign Modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState("");

  // Compute Start and End Dates based on baseDate and viewDays
  const startDateStr = useMemo(() => {
    return formatDateToLocalYMD(baseDate);
  }, [baseDate]);

  const endDateStr = useMemo(() => {
    const e = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + viewDays - 1);
    return formatDateToLocalYMD(e);
  }, [baseDate, viewDays]);

  // Load Inventory Calendar Data
  const loadInventory = useCallback(() => {
    setRefreshing(true);
    const params = new URLSearchParams({
      startDate: startDateStr,
      endDate: endDateStr,
      roomType: roomTypeFilter,
    });
    if (floorFilter !== "ALL") params.set("floor", floorFilter);

    adminFetch(`/api/room-inventory?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [startDateStr, endDateStr, roomTypeFilter, floorFilter]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Auto-refresh on focus or 30s polling
  useEffect(() => {
    const interval = setInterval(loadInventory, 30000);
    window.addEventListener("focus", loadInventory);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadInventory);
    };
  }, [loadInventory]);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - viewDays);
    d.setHours(0, 0, 0, 0);
    setBaseDate(d);
  };

  const handleNext = () => {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + viewDays);
    d.setHours(0, 0, 0, 0);
    setBaseDate(d);
  };

  const handleToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setBaseDate(d);
  };

  const handleMonthChange = (monthIndex: number) => {
    const d = new Date(baseDate.getFullYear(), monthIndex, 1);
    d.setHours(0, 0, 0, 0);
    setBaseDate(d);
  };

  const handleYearChange = (year: number) => {
    const d = new Date(year, baseDate.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    setBaseDate(d);
  };

  const handleDateSelect = (val: string) => {
    if (!val) return;
    const [y, m, day] = val.split("-").map(Number);
    const newDate = new Date(y, m - 1, day);
    newDate.setHours(0, 0, 0, 0);
    setBaseDate(newDate);
  };

  // Date columns generator
  const dateColumns = useMemo(() => {
    const cols: { dateStr: string; dayOfWeek: string; formatted: string; isToday: boolean }[] = [];
    const todayStr = formatDateToLocalYMD(new Date());

    for (let i = 0; i < viewDays; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);
      const str = formatDateToLocalYMD(d);
      cols.push({
        dateStr: str,
        dayOfWeek: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        formatted: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        isToday: str === todayStr,
      });
    }
    return cols;
  }, [baseDate, viewDays]);

  // Filtered physical rooms
  const displayRooms = useMemo(() => {
    if (!data?.rooms) return [];
    return data.rooms.filter((r: any) => {
      const matchesSearch =
        searchRoom === "" ||
        r.roomNumber.toLowerCase().includes(searchRoom.toLowerCase()) ||
        r.roomType?.name.toLowerCase().includes(searchRoom.toLowerCase());
      return matchesSearch;
    });
  }, [data?.rooms, searchRoom]);

  // Group rooms by category
  const roomsByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const r of displayRooms) {
      const catName = r.roomType?.name || "General";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(r);
    }
    return groups;
  }, [displayRooms]);

  // Action: Block Room
  const handleBlockRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/room-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BLOCK_ROOM",
          ...blockForm,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowBlockModal(false);
        setBlockForm({
          physicalRoomId: "",
          startDate: "",
          endDate: "",
          reason: "",
          blockType: "MANAGEMENT_BLOCK",
          notes: "",
        });
        loadInventory();
      } else {
        alert(d.error?.message || "Failed to block room");
      }
    } catch (err: any) {
      alert(err?.message || "Error blocking room");
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Unblock Room
  const handleUnblockRoom = async (blockId: string) => {
    if (!confirm("Release and unblock this physical room?")) return;
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/room-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UNBLOCK_ROOM", blockId }),
      });
      const d = await res.json();
      if (d.success) {
        setSelectedBlock(null);
        loadInventory();
      } else {
        alert(d.error?.message || "Failed to unblock room");
      }
    } catch (err: any) {
      alert(err?.message || "Error unblocking room");
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Move / Reassign Reservation
  const handleMoveReservation = async () => {
    if (!selectedReservation || !targetRoomId) return;
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/room-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MOVE_RESERVATION",
          bookingId: selectedReservation.id,
          targetPhysicalRoomId: targetRoomId,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowMoveModal(false);
        setSelectedReservation(null);
        loadInventory();
        alert("Reservation moved successfully!");
      } else {
        alert(d.error?.message || "Failed to move reservation");
      }
    } catch (err: any) {
      alert(err?.message || "Error moving reservation");
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data?.reservations) return;
    const exportRows = data.reservations.map((r: any) => ({
      Room: r.roomNumber,
      RoomType: r.roomTypeName,
      BookingRef: r.referenceId,
      Guest: r.guestName,
      Phone: r.guestPhone,
      CheckIn: r.checkIn.split("T")[0],
      CheckOut: r.checkOut.split("T")[0],
      Status: r.status,
      Total: r.totalAmount,
      Paid: r.paidAmount,
      Balance: r.balanceAmount,
    }));

    try {
      const csv = new Parser().parse(exportRows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rajhans_Room_Plan_${startDateStr}_to_${endDateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV error:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-16">
      {/* 1. Header Title & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Room Inventory Plan & Tape Chart
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
              PostgreSQL Live
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Visual physical-room timeline, multi-day occupancy, reservation bars, and room blocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInventory}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Tape Chart
          </button>
        </div>
      </div>

      {/* 2. Real-Time Inventory Summary KPI Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Rooms</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{data.summary.totalRooms}</div>
          </div>
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Available</div>
            <div className="text-xl font-bold text-emerald-800 mt-1">{data.summary.available}</div>
          </div>
          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Occupied</div>
            <div className="text-xl font-bold text-rose-800 mt-1">{data.summary.occupied}</div>
          </div>
          <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Reserved</div>
            <div className="text-xl font-bold text-sky-800 mt-1">{data.summary.reserved}</div>
          </div>
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Dirty</div>
            <div className="text-xl font-bold text-amber-800 mt-1">{data.summary.dirty}</div>
          </div>
          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Maintenance</div>
            <div className="text-xl font-bold text-purple-800 mt-1">{data.summary.maintenance}</div>
          </div>
          <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Blocked</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{data.summary.blocked}</div>
          </div>
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Today Occupancy</div>
            <div className="text-xl font-bold text-white mt-1">{data.summary.occupancyRate}%</div>
          </div>
        </div>
      )}

      {/* 3. Navigation Bar & Period Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        {/* Date Stepper & Month / Year Jump */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stepper Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
              title="Previous Period"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
              title="Next Period"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Month Dropdown */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <select
                value={baseDate.getMonth()}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-slate-900 shadow-xs focus:ring-2 focus:ring-slate-900 cursor-pointer"
                title="Select Month"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <select
                value={baseDate.getFullYear()}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="text-xs font-bold px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white text-slate-900 shadow-xs focus:ring-2 focus:ring-slate-900 cursor-pointer"
                title="Select Year"
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Date Picker Input */}
            <div className="flex items-center gap-1 border border-slate-300 rounded-xl px-2 py-1 bg-white shadow-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer w-28"
                title="Pick exact start date"
              />
            </div>
          </div>

          <span className="font-bold text-xs text-slate-800 ml-1 font-mono bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            {startDateStr} → {endDateStr}
          </span>
        </div>

        {/* View Range Buttons (7, 14, 30 days) */}
        <div className="flex items-center gap-1.5">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setViewDays(days as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewDays === days
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search room..."
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 w-36"
            />
          </div>

          <select
            value={roomTypeFilter}
            onChange={(e) => setRoomTypeFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">All Categories</option>
            <option value="EXECUTIVE">AC Executive</option>
            <option value="DELUXE">AC Deluxe</option>
            <option value="ROYAL_SUITE">Royal Suite</option>
          </select>
        </div>
      </div>

      {/* 4. Accessible Color Status Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-600"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-sky-500 border border-sky-600"></span>
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-500 border border-rose-600"></span>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-400 border border-amber-500"></span>
          <span>Dirty / Cleaning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-purple-500 border border-purple-600"></span>
          <span>Maintenance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-slate-800 border border-slate-900"></span>
          <span>Blocked</span>
        </div>
      </div>

      {/* 5. Main Tape Chart Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-900" />
            <span className="text-xs uppercase tracking-widest font-extrabold text-slate-900">
              Generating Room Inventory Timeline...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[700px]">
            <table className="w-full border-collapse text-xs select-none">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-300">
                <tr>
                  {/* Sticky Top-Left Room Header */}
                  <th className="sticky left-0 z-30 bg-slate-100 p-3 min-w-[180px] text-left border-r border-slate-300 uppercase tracking-wider text-[11px] font-bold text-slate-700">
                    Physical Room
                  </th>
                  {/* Date Columns */}
                  {dateColumns.map((col) => {
                    const occ = data?.dailyOccupancy?.[col.dateStr];
                    return (
                      <th
                        key={col.dateStr}
                        className={`p-2.5 text-center min-w-[110px] border-r border-slate-200 ${
                          col.isToday ? "bg-amber-100/60 font-bold" : ""
                        }`}
                      >
                        <div className="text-[10px] font-mono text-slate-500">{col.dayOfWeek}</div>
                        <div className={`text-xs font-bold ${col.isToday ? "text-amber-900 font-extrabold" : "text-slate-900"}`}>
                          {col.formatted}
                        </div>
                        {occ && (
                          <div className="text-[9px] font-mono font-semibold text-slate-600 mt-0.5">
                            {occ.percentage}% occ
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body grouped by Room Category */}
              <tbody className="divide-y divide-slate-200">
                {Object.entries(roomsByCategory).map(([categoryName, rooms]) => (
                  <tr key={categoryName} className="contents">
                    {/* Category Divider Header */}
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <td
                        colSpan={dateColumns.length + 1}
                        className="py-1.5 px-4 font-bold text-xs uppercase tracking-wider text-slate-600 bg-slate-50"
                      >
                        {categoryName} ({rooms.length} rooms)
                      </td>
                    </tr>

                    {/* Room Rows */}
                    {rooms.map((room) => {
                      return (
                        <tr key={room.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Sticky Room Info Cell */}
                          <td className="sticky left-0 z-10 bg-white p-3 border-r border-slate-300 shadow-xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-sm text-slate-900 font-mono">
                                  #{room.roomNumber}
                                </span>
                                <span className="text-[10px] text-slate-500 block font-semibold">
                                  Floor {room.floor}
                                </span>
                              </div>
                              <span
                                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                  room.housekeepingStatus === "READY"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : room.housekeepingStatus === "DIRTY"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {room.housekeepingStatus}
                              </span>
                            </div>
                          </td>

                          {/* Date Cells for Room */}
                          {dateColumns.map((col) => {
                            const dateMidnight = new Date(`${col.dateStr}T12:00:00.000Z`);

                            // 1. Check for Active Reservation on this date
                            const activeRes = data?.reservations?.find((r: any) => {
                              if (r.physicalRoomId !== room.id) return false;
                              const cin = new Date(r.checkIn);
                              const cout = new Date(r.checkOut);
                              // Active overnight stay if cin <= date < cout
                              return cin <= dateMidnight && cout > dateMidnight;
                            });

                            // 2. Check for Check-in / Checkout events on this date
                            const isCheckInDay = data?.reservations?.some((r: any) => {
                              return (
                                r.physicalRoomId === room.id &&
                                r.checkIn.split("T")[0] === col.dateStr
                              );
                            });

                            const isCheckOutDay = data?.reservations?.some((r: any) => {
                              return (
                                r.physicalRoomId === room.id &&
                                r.checkOut.split("T")[0] === col.dateStr
                              );
                            });

                            // 3. Check for Room Block
                            const activeBlock = data?.blocks?.find((b: any) => {
                              if (b.physicalRoomId !== room.id) return false;
                              const s = new Date(b.startDate);
                              const e = new Date(b.endDate);
                              return s <= dateMidnight && e >= dateMidnight;
                            });

                            // 4. Check for Maintenance
                            const isMaintenance =
                              room.status === "MAINTENANCE" ||
                              room.maintenanceStatus === "OUT_OF_ORDER" ||
                              room.maintenanceStatus === "UNDER_REPAIR";

                            return (
                              <td
                                key={col.dateStr}
                                className={`p-1 border-r border-slate-200 relative h-14 min-w-[110px] align-middle ${
                                  col.isToday ? "bg-amber-50/20" : ""
                                }`}
                              >
                                {activeRes ? (
                                  <div
                                    onClick={() => setSelectedReservation(activeRes)}
                                    className={`w-full h-11 rounded-lg px-2 py-1 text-white font-semibold cursor-pointer shadow-xs transition-all hover:brightness-110 flex flex-col justify-between ${
                                      activeRes.hasConflict
                                        ? "bg-rose-700 ring-2 ring-rose-400 animate-pulse"
                                        : activeRes.status === "CHECKED_IN"
                                        ? "bg-rose-600"
                                        : activeRes.status === "CONFIRMED"
                                        ? "bg-sky-600"
                                        : "bg-slate-700"
                                    }`}
                                    title={`${activeRes.guestName} (${activeRes.referenceId})`}
                                  >
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="truncate font-bold max-w-[70px]">
                                        {activeRes.guestName}
                                      </span>
                                      {activeRes.hasConflict && (
                                        <span className="text-[9px] bg-white text-rose-700 px-1 rounded font-extrabold">
                                          CONFLICT
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-100">
                                      <span>{activeRes.referenceId.slice(-4)}</span>
                                      <span className="uppercase text-[8px] opacity-90">{activeRes.status}</span>
                                    </div>
                                  </div>
                                ) : activeBlock ? (
                                  <div
                                    onClick={() => setSelectedBlock(activeBlock)}
                                    className="w-full h-11 rounded-lg bg-slate-900 text-white p-1 text-[10px] font-bold flex flex-col justify-between cursor-pointer hover:bg-slate-800"
                                    title={`Blocked: ${activeBlock.reason}`}
                                  >
                                    <div className="flex items-center gap-1 text-[9px] text-amber-300">
                                      <Lock className="h-3 w-3" /> BLOCKED
                                    </div>
                                    <div className="truncate text-[9px] text-slate-300">
                                      {activeBlock.reason}
                                    </div>
                                  </div>
                                ) : isMaintenance ? (
                                  <div className="w-full h-11 rounded-lg bg-purple-100 border border-purple-300 text-purple-900 p-1 flex items-center justify-center gap-1 text-[10px] font-bold">
                                    <Wrench className="h-3.5 w-3.5 text-purple-700" />
                                    <span>MAINT</span>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => setSelectedCell({ room, dateStr: col.dateStr })}
                                    className="w-full h-11 rounded-lg border border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-emerald-700 transition-all group"
                                  >
                                    <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-[9px] text-slate-400 group-hover:text-emerald-700 font-semibold">
                                      Available
                                    </span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Click Cell Quick Action Menu */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Room #{selectedCell.room.roomNumber} ({selectedCell.room.roomType?.name})
                </h3>
                <p className="text-xs text-slate-500 font-mono">Date: {selectedCell.dateStr}</p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <a
                href={`/admin/front-desk?roomTypeId=${selectedCell.room.roomTypeId}&physicalRoomId=${selectedCell.room.id}&checkIn=${selectedCell.dateStr}`}
                className="w-full py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-between"
              >
                <span>New Front Desk Walk-In</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={() => {
                  const cin = selectedCell.dateStr;
                  const cout = new Date(new Date(cin).getTime() + 86400000).toISOString().split("T")[0];
                  setBlockForm({
                    physicalRoomId: selectedCell.room.id,
                    startDate: cin,
                    endDate: cout,
                    reason: "Management Hold",
                    blockType: "MANAGEMENT_BLOCK",
                    notes: "",
                  });
                  setSelectedCell(null);
                  setShowBlockModal(true);
                }}
                className="w-full py-2.5 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span>Block Room for Dates</span>
                <Lock className="h-4 w-4" />
              </button>

              <a
                href={`/admin/maintenance?roomNumber=${selectedCell.room.roomNumber}`}
                className="w-full py-2.5 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-between"
              >
                <span>Schedule Maintenance</span>
                <Wrench className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 7. Reservation Inspection & Actions Drawer / Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-mono text-slate-900">
                    {selectedReservation.referenceId}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      selectedReservation.status === "CONFIRMED"
                        ? "bg-sky-100 text-sky-800"
                        : selectedReservation.status === "CHECKED_IN"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {selectedReservation.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  Guest: <span className="font-bold text-slate-900">{selectedReservation.guestName}</span>
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Phone: {selectedReservation.guestPhone || "Not provided"}
                </p>
              </div>
              <button
                onClick={() => setSelectedReservation(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Reservation Meta Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Room Assigned</span>
                <div className="font-bold text-slate-900 mt-0.5">
                  Room #{selectedReservation.roomNumber} ({selectedReservation.roomTypeName})
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Stay Interval</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {selectedReservation.checkIn.split("T")[0]} → {selectedReservation.checkOut.split("T")[0]}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Total Billed</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  ₹{selectedReservation.totalAmount?.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Outstanding Balance</span>
                <div
                  className={`font-mono font-bold mt-0.5 ${
                    selectedReservation.balanceAmount > 0 ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  ₹{selectedReservation.balanceAmount?.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setTargetRoomId(selectedReservation.physicalRoomId || "");
                  setShowMoveModal(true);
                }}
                className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Transfer / Reassign Room
              </button>
              <a
                href={`/admin/folios?search=${selectedReservation.referenceId}`}
                className="py-2 px-3.5 border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
              >
                Open Folio Ledger
              </a>
              <a
                href={`/api/invoice/${selectedReservation.id}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3.5 border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
              >
                Print Invoice
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 8. Block Room Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Block Physical Room</h3>
              <button onClick={() => setShowBlockModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBlockRoom} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Physical Room</label>
                <select
                  value={blockForm.physicalRoomId}
                  onChange={(e) => setBlockForm({ ...blockForm, physicalRoomId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                  required
                >
                  <option value="">Select Room</option>
                  {data?.rooms?.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      Room #{r.roomNumber} ({r.roomType?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={blockForm.startDate}
                    onChange={(e) => setBlockForm({ ...blockForm, startDate: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={blockForm.endDate}
                    onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Block Classification</label>
                <select
                  value={blockForm.blockType}
                  onChange={(e) => setBlockForm({ ...blockForm, blockType: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="MANAGEMENT_BLOCK">Management Hold</option>
                  <option value="VIP_HOLD">VIP Guest Hold</option>
                  <option value="DEEP_CLEANING">Deep Sanitization</option>
                  <option value="MAINTENANCE">Maintenance Hold</option>
                  <option value="RENOVATION">Renovation / Civil Work</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reserved for VIP arrival, Floor repainting"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Blocking..." : "Block Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Move / Reassign Reservation Modal */}
      {showMoveModal && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Reassign Room — {selectedReservation.referenceId}
              </h3>
              <button onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div>
                Guest: <span className="font-bold text-slate-900">{selectedReservation.guestName}</span>
              </div>
              <div>
                Current Room: <span className="font-bold text-slate-900">Room #{selectedReservation.roomNumber}</span>
              </div>
              <div className="font-mono text-slate-500">
                {selectedReservation.checkIn.split("T")[0]} → {selectedReservation.checkOut.split("T")[0]}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Select Target Physical Room</label>
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {data?.rooms?.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    Room #{r.roomNumber} — {r.roomType?.name} (Floor {r.floor})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Server will verify zero overlapping stay or room block before committing transfer.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveReservation}
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Transferring..." : "Confirm Room Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Selected Block Details Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Room #{selectedBlock.physicalRoom?.roomNumber} Block Details
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                  {selectedBlock.blockType}
                </span>
              </div>
              <button onClick={() => setSelectedBlock(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 font-bold">Reason:</span>
                <p className="font-semibold text-slate-900">{selectedBlock.reason}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Duration:</span>
                <p className="font-mono text-slate-800">
                  {selectedBlock.startDate.split("T")[0]} → {selectedBlock.endDate.split("T")[0]}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Blocked By:</span>
                <p className="text-slate-800">{selectedBlock.createdBy || "Staff"}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedBlock(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleUnblockRoom(selectedBlock.id)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Unlock className="h-3.5 w-3.5" /> Release Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
