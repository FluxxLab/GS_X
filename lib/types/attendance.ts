import type { Employee } from './employee';

// ─── Attendance ──────────────────────────────────────────────────────────────

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'on_leave'
  | 'holiday'
  | 'weekend';

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number | null;
  status: AttendanceStatus;
  lateMinutes: number | null;
  overtimeHours: number | null;
  notes: string | null;
  clockInLocation: string | null;
  clockOutLocation: string | null;
  workMode: string | null;
  ipAddress: string | null;
  ipFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  totalHours: number;
  avgHoursPerDay: number;
  overtimeHours: number;
}

export interface MonthlyReportEmployee {
  employeeId: string;
  employeeName: string;
  department: string;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  totalHours: number;
  overtimeHours: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  employees: MonthlyReportEmployee[];
  summary: {
    totalEmployees: number;
    avgAttendanceRate: number;
    totalOvertimeHours: number;
  };
}

// ─── Leave ───────────────────────────────────────────────────────────────────

export type LeaveType =
  | 'annual'
  | 'sick'
  | 'casual'
  | 'maternity'
  | 'paternity'
  | 'compassionate'
  | 'study'
  | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

/** Full day, or a half day (morning/afternoon) for a single-day leave. */
export type LeaveDayPart = 'full' | 'morning' | 'afternoon';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  dayPart: LeaveDayPart;
  reason: string | null;
  status: LeaveStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  [leaveType: string]: {
    total: number;
    used: number;
    remaining: number;
    accrued?: number;
    carriedOver?: number;
  };
}

export type LeaveTypeKey =
  | "annual"
  | "sick"
  | "casual"
  | "maternity"
  | "paternity"
  | "compassionate"
  | "study"
  | "unpaid";

export interface LeaveAccrualPolicy {
  id: string;
  leaveType: LeaveTypeKey;
  annualEntitlement: number;
  monthlyAccrual: boolean;
  carryoverCap: number;
  carryoverExpiryMonths: number;
}

// ─── Query Params ────────────────────────────────────────────────────────────

export interface AttendanceQueryParams {
  employeeId?: string;
  departmentId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface LeaveQueryParams {
  employeeId?: string;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface ClockInPayload {
  employeeId?: string;
  location?: string;
  notes?: string;
}

export interface ClockOutPayload {
  employeeId?: string;
  location?: string;
  notes?: string;
}

export interface CreateLeaveRequestPayload {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  dayPart?: LeaveDayPart;
  reason?: string;
}

// ─── Office IP ──────────────────────────────────────────────────────

export interface OfficeIp {
  id: string;
  ip: string;
  label: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfficeIpPayload {
  ip: string;
  label: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateOfficeIpPayload = Partial<CreateOfficeIpPayload>;

// ─── Remote Work Request ────────────────────────────────────────────

export type RemoteWorkType = 'work_from_home' | 'field_work';
export type RemoteWorkStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface RemoteWorkRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  type: RemoteWorkType;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: RemoteWorkStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRemoteWorkRequestPayload {
  employeeId: string;
  type?: RemoteWorkType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface RemoteWorkQueryParams {
  employeeId?: string;
  managerId?: string;
  status?: RemoteWorkStatus;
  page?: number;
  limit?: number;
}

// ─── Overtime Request ──────────────────────────────────────────────

export type OvertimeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  expectedHours: number;
  reason: string | null;
  status: OvertimeStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  actualHours: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOvertimeRequestPayload {
  employeeId: string;
  date: string;
  expectedHours: number;
  reason?: string;
}

export interface OvertimeQueryParams {
  employeeId?: string;
  status?: OvertimeStatus;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
