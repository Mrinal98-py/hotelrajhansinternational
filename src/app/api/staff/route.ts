import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess, authorizeRole, requireAuth } from "@/lib/security";
import { Role } from "@prisma/client";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const [employees, departments, shifts, attendance] = await Promise.all([
      prisma.employee.findMany({
        where: { isActive: true },
        include: { department: true, user: true },
        orderBy: { firstName: "asc" },
      }),
      prisma.department.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.staffShift.findMany({
        where: { date },
        include: { employee: true },
      }),
      prisma.staffAttendance.findMany({
        where: { date },
        include: { employee: true },
      }),
    ]);

    return apiSuccess({ employees, departments, shifts, attendance });
  } catch (error: any) {
    console.error("GET Staff Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to fetch staff data", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    const auth = requireAuth(session, ["SUPER_ADMIN", "MANAGER"]);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json().catch(() => ({}));
    const { action } = body; // 'SAVE_EMPLOYEE', 'ASSIGN_SHIFT', 'RECORD_ATTENDANCE'

    if (action === "SAVE_EMPLOYEE") {
      const {
        id,
        employeeCode,
        firstName,
        lastName,
        email,
        phone,
        role = "STAFF",
        departmentId,
        salary,
        isActive = true,
      } = body;

      if (!employeeCode || !firstName || !lastName || !email || !phone) {
        return apiError("VALIDATION_ERROR", "Employee code, name, email, and phone are required", 400);
      }

      let employee;
      if (id) {
        employee = await prisma.employee.update({
          where: { id },
          data: {
            employeeCode,
            firstName,
            lastName,
            email,
            phone,
            role: role as Role,
            departmentId: departmentId || null,
            salary: salary ? parseFloat(salary) : null,
            isActive,
          },
        });
      } else {
        employee = await prisma.employee.create({
          data: {
            employeeCode,
            firstName,
            lastName,
            email,
            phone,
            role: role as Role,
            departmentId: departmentId || null,
            salary: salary ? parseFloat(salary) : null,
            isActive,
          },
        });
      }

      return apiSuccess({ message: "Employee record saved", employee });
    }

    if (action === "ASSIGN_SHIFT") {
      const { employeeId, shiftType, date, startTime, endTime, notes } = body;
      if (!employeeId || !shiftType || !date || !startTime || !endTime) {
        return apiError("VALIDATION_ERROR", "Missing required shift fields", 400);
      }

      const shift = await prisma.staffShift.create({
        data: {
          employeeId,
          shiftType,
          date,
          startTime,
          endTime,
          notes,
        },
        include: { employee: true },
      });

      return apiSuccess({ message: "Shift assigned successfully", shift }, 201);
    }

    if (action === "RECORD_ATTENDANCE") {
      const { employeeId, date, status, notes } = body;
      if (!employeeId || !date || !status) {
        return apiError("VALIDATION_ERROR", "employeeId, date, and status are required", 400);
      }

      const attendance = await prisma.staffAttendance.upsert({
        where: { employeeId_date: { employeeId, date } },
        update: {
          status,
          notes,
          checkInTime: status === "PRESENT" ? new Date() : undefined,
        },
        create: {
          employeeId,
          date,
          status,
          notes,
          checkInTime: status === "PRESENT" ? new Date() : undefined,
        },
      });

      return apiSuccess({ message: "Attendance recorded", attendance });
    }

    return apiError("VALIDATION_ERROR", "Invalid action", 400);
  } catch (error: any) {
    console.error("POST Staff Error:", error);
    return apiError("DATABASE_ERROR", error?.message || "Failed to process staff action", 500);
  }
}
