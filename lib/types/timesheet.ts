export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected";

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeStaffId: string | null;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  overtimeHours: number;
  daysPresent: number;
  daysAbsent: number;
  daysOnLeave: number;
  status: TimesheetStatus;
  note: string | null;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitTimesheetPayload {
  periodStart: string;
  periodEnd: string;
  note?: string;
}

export interface TimesheetQueryParams {
  status?: TimesheetStatus;
  employeeId?: string;
}
