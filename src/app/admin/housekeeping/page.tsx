"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { formatDate } from "@/lib/utils";
import {
  Sparkles,
  BedDouble,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  Play,
  Check,
  Search,
} from "lucide-react";

export default function HousekeepingPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [activeTab, setActiveTab] = useState<"TASKS" | "ROOMS">("TASKS");

  // Create task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    physicalRoomId: "",
    taskType: "CHECKOUT_CLEAN",
    priority: "HIGH",
    assignedToName: "",
    notes: "",
  });
  const [savingTask, setSavingTask] = useState(false);

  // Banner
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await adminFetch("/api/housekeeping");
      const data = await res.json();
      if (data.success) {
        setTasks(data.data.tasks || []);
        setRooms(data.data.rooms || []);
        setMetrics(data.data.metrics || {});
      } else {
        setBanner({ type: "error", text: data.error?.message || "Failed to load housekeeping" });
      }
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Failed to fetch housekeeping data" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle task status progression
  const handleUpdateTaskStatus = async (taskId: string, targetStatus: string) => {
    try {
      const res = await adminFetch("/api/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_TASK",
          taskId,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBanner({ type: "success", text: `Task updated to ${targetStatus}` });
        fetchData();
      } else {
        setBanner({ type: "error", text: data.error?.message || "Failed to update task" });
      }
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Action failed" });
    }
  };

  // Handle room status quick change
  const handleChangeRoomStatus = async (physicalRoomId: string, housekeepingStatus: string) => {
    try {
      const res = await adminFetch("/api/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHANGE_ROOM_STATUS",
          physicalRoomId,
          housekeepingStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBanner({ type: "success", text: `Room marked as ${housekeepingStatus}` });
        fetchData();
      } else {
        setBanner({ type: "error", text: data.error?.message || "Failed to update room" });
      }
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Action failed" });
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.physicalRoomId) return;

    try {
      setSavingTask(true);
      const res = await adminFetch("/api/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_TASK",
          ...taskForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBanner({ type: "success", text: "Housekeeping task created successfully" });
        setShowTaskModal(false);
        fetchData();
      } else {
        setBanner({ type: "error", text: data.error?.message || "Failed to create task" });
      }
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Failed to create task" });
    } finally {
      setSavingTask(false);
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Ready Rooms</span>
          <p className="text-2xl font-bold font-serif text-emerald-600 mt-2">{metrics.readyRooms ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Clean & Inspected</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Dirty Rooms</span>
          <p className="text-2xl font-bold font-serif text-amber-600 mt-2">{metrics.dirtyRooms ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Awaiting Cleaning</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">In Cleaning</span>
          <p className="text-2xl font-bold font-serif text-blue-600 mt-2">{metrics.cleaningRooms ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Housekeeper Active</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">In Inspection</span>
          <p className="text-2xl font-bold font-serif text-purple-600 mt-2">{metrics.inspectionRooms ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Supervisor Review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Open Tasks</span>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-2">{metrics.pendingTasks ?? 0}</p>
          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Pending Action</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("TASKS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "TASKS"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Cleaning Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("ROOMS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "ROOMS"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Room Cleaning Grid ({rooms.length})
          </button>
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
            onClick={() => setShowTaskModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Assign Cleaning Task
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading housekeeping records...
        </div>
      ) : activeTab === "TASKS" ? (
        /* Task List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No active housekeeping tasks found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-700 font-bold">
                  <tr>
                    <th className="py-3 px-4">Room & Floor</th>
                    <th className="py-3 px-4">Task Type</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Assigned Attendant</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Progression Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                          Room {task.physicalRoom?.roomNumber}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Floor {task.physicalRoom?.floor} • {task.physicalRoom?.roomType?.name}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {task.taskType.replace(/_/g, " ")}
                        {task.notes && <p className="text-[10px] text-slate-400 font-normal">{task.notes}</p>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                            task.priority === "URGENT" || task.priority === "HIGH"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {task.assignedToName || "Unassigned Staff"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            task.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : task.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : task.status === "INSPECTION"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {task.status === "PENDING" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Play className="h-3 w-3" /> Start
                            </button>
                          )}

                          {task.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, "INSPECTION")}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Check className="h-3 w-3" /> Submit for Inspection
                            </button>
                          )}

                          {task.status === "INSPECTION" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, "COMPLETED")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Approve Ready
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
      ) : (
        /* Room Readiness Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-900">
                  {room.roomNumber}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                    room.housekeepingStatus === "READY"
                      ? "bg-emerald-100 text-emerald-800"
                      : room.housekeepingStatus === "DIRTY"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {room.housekeepingStatus}
                </span>
              </div>

              <p className="text-[10px] text-slate-500 truncate">
                Floor {room.floor} • {room.roomType?.name}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                {room.housekeepingStatus !== "READY" ? (
                  <button
                    onClick={() => handleChangeRoomStatus(room.id, "READY")}
                    className="w-full py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Mark Ready
                  </button>
                ) : (
                  <button
                    onClick={() => handleChangeRoomStatus(room.id, "DIRTY")}
                    className="w-full py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Mark Dirty
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-base font-bold text-slate-900">Create Housekeeping Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Physical Room *</label>
                <select
                  required
                  value={taskForm.physicalRoomId}
                  onChange={(e) => setTaskForm({ ...taskForm, physicalRoomId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-bold"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} (Floor {r.floor} • {r.housekeepingStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Task Type</label>
                  <select
                    value={taskForm.taskType}
                    onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="CHECKOUT_CLEAN">Checkout Clean</option>
                    <option value="DAILY_CLEAN">Daily Refresh</option>
                    <option value="DEEP_CLEAN">Deep Clean</option>
                    <option value="INSPECTION">Inspection</option>
                    <option value="TOUCH_UP">Touch Up</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Attendant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunil Kumar"
                  value={taskForm.assignedToName}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions / Notes</label>
                <textarea
                  placeholder="e.g. Change bedsheet, sanitize washroom, replenish water bottles"
                  rows={2}
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask || !taskForm.physicalRoomId}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingTask ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
