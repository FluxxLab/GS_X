export type EmployeeLoanType = "loan" | "salary_advance";
export type EmployeeLoanStatus =
  | "pending"
  | "active"
  | "completed"
  | "rejected"
  | "cancelled";

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeStaffId: string | null;
  type: EmployeeLoanType;
  principal: number;
  annualRate: number;
  termMonths: number;
  startDate: string;
  monthlyDeduction: number;
  outstandingBalance: number;
  principalRepaid: number;
  interestPaid: number;
  periodsPaid: number;
  status: EmployeeLoanStatus;
  reason: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  lastPayrollRunId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeLoanScheduleRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface EmployeeLoanWithSchedule {
  loan: EmployeeLoan;
  schedule: EmployeeLoanScheduleRow[];
}

export interface CreateEmployeeLoanPayload {
  employeeId: string;
  type?: EmployeeLoanType;
  principal: number;
  annualRate?: number;
  termMonths: number;
  startDate: string;
  reason?: string;
}

export interface EmployeeLoanQueryParams {
  status?: EmployeeLoanStatus;
  employeeId?: string;
  search?: string;
}
