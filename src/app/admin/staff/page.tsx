"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Building2,
  X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminStaffPage() {
  const [data, setData] = useState<any>({ employees: [], departments: [], shifts: [], attendance: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "ATTENDANCE" | "SHIFTS">("DIRECTORY");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

  // Modals
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [showAssignShift, setShowAssignShift] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [empForm, setEmpForm] = useState({
    id: "",
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "STAFF",
    departmentId: "",
    salary: "",
  });

  const [shiftForm, setShiftForm] = useState({
    employeeId: "",
    shiftType: "MORNING",
    date: selectedDate,
    startTime: "07:00",
    endTime: "15:00",
    notes: "",
  });

  const loadData = useCallback(() => {
    setLoading(true);
    adminFetch(`/api/staff?date=${selectedDate}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
          if (resData.data.employees?.length > 0 && !shiftForm.employeeId) {
            setShiftForm((prev) => ({ ...prev, employeeId: resData.data.employees[0].id }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDate, shiftForm.employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_EMPLOYEE",
          ...empForm,
          departmentId: empForm.departmentId || null,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowAddEmp(false);
        setEmpForm({
          id: "",
          employeeCode: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "STAFF",
          departmentId: "",
          salary: "",
        });
        loadData();
      } else {
        alert(d.error?.message || "Failed to save employee");
      }
    } catch (err: any) {
      alert(err?.message || "Error saving employee");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminFetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_SHIFT",
          ...shiftForm,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowAssignShift(false);
        loadData();
      } else {
        alert(d.error?.message || "Failed to assign shift");
      }
    } catch (err: any) {
      alert(err?.message || "Error assigning shift");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetAttendance = async (employeeId: string, status: string) => {
    try {
      const res = await adminFetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_ATTENDANCE",
          employeeId,
          date: selectedDate,
          status,
        }),
      });
      const d = await res.json();
      if (d.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEmployees = data.employees.filter((emp: any) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === "ALL" || emp.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Staff Roster & Attendance
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Manage hotel employees, departments, daily shift scheduling, and attendance logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-2 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => {
              setEmpForm({
                id: "",
                employeeCode: `EMP-${data.employees.length + 101}`,
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                role: "STAFF",
                departmentId: data.departments[0]?.id || "",
                salary: "",
              });
              setShowAddEmp(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: "DIRECTORY", label: "Employee Roster", icon: Users },
            { id: "ATTENDANCE", label: "Daily Attendance", icon: UserCheck },
            { id: "SHIFTS", label: "Shift Schedule", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {(activeTab === "ATTENDANCE" || activeTab === "SHIFTS") && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Directory */}
      {activeTab === "DIRECTORY" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex-1 min-w-[260px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, code, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="ALL">All Departments</option>
                {data.departments?.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{emp.employeeCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {emp.department?.name || "General"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-800">
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {emp.phone} • {emp.email}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            emp.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === "ATTENDANCE" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Daily Attendance Sheet — {new Date(selectedDate).toLocaleDateString("en-IN", { dateStyle: "full" })}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-3">Staff Code</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Recorded Status</th>
                  <th className="py-3 px-3 text-right">Quick Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.employees.map((emp: any) => {
                  const record = data.attendance?.find((a: any) => a.employeeId === emp.id);
                  const status = record?.status || "NOT_MARKED";

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{emp.employeeCode}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{emp.department?.name || "General"}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            status === "PRESENT"
                              ? "bg-emerald-100 text-emerald-800"
                              : status === "ABSENT"
                              ? "bg-rose-100 text-rose-800"
                              : status === "ON_LEAVE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSetAttendance(emp.id, "PRESENT")}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              status === "PRESENT"
                                ? "bg-emerald-700 text-white"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleSetAttendance(emp.id, "ABSENT")}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              status === "ABSENT"
                                ? "bg-rose-700 text-white"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleSetAttendance(emp.id, "ON_LEAVE")}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              status === "ON_LEAVE"
                                ? "bg-amber-600 text-white"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Shift Schedule */}
      {activeTab === "SHIFTS" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Shift Assignments for {selectedDate}</h3>
              <p className="text-xs text-slate-500">Morning, Evening, and Night duty rosters.</p>
            </div>
            <button
              onClick={() => {
                setShiftForm((prev) => ({ ...prev, date: selectedDate }));
                setShowAssignShift(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Assign Shift
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["MORNING", "EVENING", "NIGHT"].map((shiftType) => {
              const assigned = data.shifts?.filter((s: any) => s.shiftType === shiftType) || [];
              return (
                <div key={shiftType} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold uppercase text-slate-800">{shiftType} SHIFT</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {shiftType === "MORNING"
                        ? "07:00 - 15:00"
                        : shiftType === "EVENING"
                        ? "15:00 - 23:00"
                        : "23:00 - 07:00"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {assigned.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                        No staff assigned
                      </div>
                    ) : (
                      assigned.map((s: any) => (
                        <div key={s.id} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                          <div className="font-bold text-slate-900">
                            {s.employee?.firstName} {s.employee?.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {s.startTime} - {s.endTime} {s.notes && `• ${s.notes}`}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Register New Staff Member</h3>
              <button onClick={() => setShowAddEmp(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={empForm.firstName}
                    onChange={(e) => setEmpForm({ ...empForm, firstName: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={empForm.lastName}
                    onChange={(e) => setEmpForm({ ...empForm, lastName: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Staff Code</label>
                  <input
                    type="text"
                    required
                    value={empForm.employeeCode}
                    onChange={(e) => setEmpForm({ ...empForm, employeeCode: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Department</label>
                  <select
                    value={empForm.departmentId}
                    onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {data.departments?.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    required
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">System Role & Access</label>
                <select
                  value={empForm.role}
                  onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="STAFF">Staff (Standard)</option>
                  <option value="RECEPTION">Receptionist</option>
                  <option value="HOUSEKEEPING">Housekeeping Staff</option>
                  <option value="MAINTENANCE">Maintenance Engineer</option>
                  <option value="RESTAURANT">Restaurant / Kitchen</option>
                  <option value="MANAGER">Operations Manager</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddEmp(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Register Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Shift Modal */}
      {showAssignShift && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Assign Staff Shift</h3>
              <button onClick={() => setShowAssignShift(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignShift} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Select Employee</label>
                <select
                  value={shiftForm.employeeId}
                  onChange={(e) => setShiftForm({ ...shiftForm, employeeId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                  required
                >
                  {data.employees?.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode} - {emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Shift Type</label>
                <select
                  value={shiftForm.shiftType}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftType: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="MORNING">Morning (07:00 - 15:00)</option>
                  <option value="EVENING">Evening (15:00 - 23:00)</option>
                  <option value="NIGHT">Night (23:00 - 07:00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    required
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">End Time</label>
                  <input
                    type="time"
                    required
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Duty Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Front desk duty, 2nd floor housekeeping"
                  value={shiftForm.notes}
                  onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAssignShift(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Assigning..." : "Confirm Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
