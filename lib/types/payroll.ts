import type { Employee } from './employee';

// ─── Payroll Run ────────────────────────────────────────────────────

export type PayrollRunStatus = 'draft' | 'calculating' | 'calculated' | 'approved' | 'processing' | 'completed' | 'cancelled';

export type PayrollRunType = 'regular' | 'bonus' | 'thirteenth_month';

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  runType: PayrollRunType;
  bonusPercent: number;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  totalPaye: number;
  totalPension: number;
  totalEmployerPension: number;
  totalNhf: number;
  totalNhis: number;
  totalEmployerNhis: number;
  totalNsitf: number;
  totalItf: number;
  totalEmployerCosts: number;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  processedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Payslip ────────────────────────────────────────────────────────

export type PayslipStatus = 'pending' | 'processed' | 'paid';

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employee?: Employee;
  month: number;
  year: number;

  // Salary structure
  grossSalary: number;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;

  // Employee deductions
  pensionEmployee: number;
  nhf: number;
  nhis: number;
  paye: number;
  taxableIncomeAnnual: number;
  payeAnnual: number;
  rentRelief: number;
  overtimePay: number;
  bonuses: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;

  // Employer contributions
  pensionEmployer: number;
  nhisEmployer: number;
  nsitf: number;
  itf: number;
  totalEmployerCosts: number;

  // Status
  status: PayslipStatus;

  // Employee snapshot
  employeeName: string;
  employeeStaffId: string;
  departmentName: string | null;
  jobTitle: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  pensionProvider: string | null;
  pensionNumber: string | null;
  taxId: string | null;

  createdAt: string;
  updatedAt: string;
}

// ─── Tax Filing ─────────────────────────────────────────────────────

export type TaxType = 'paye' | 'pension' | 'nhf' | 'nhis' | 'nsitf' | 'itf' | 'vat' | 'wht';
export type TaxFilingStatus = 'draft' | 'pending' | 'filed' | 'remitted' | 'overdue';

export interface TaxFiling {
  id: string;
  filingReference: string;
  taxType: TaxType;
  period: string;
  month: number | null;
  year: number;
  totalEmployees: number;
  grossPayroll: number;
  taxAmount: number;
  status: TaxFilingStatus;
  dueDate: string | null;
  filedDate: string | null;
  remittedDate: string | null;
  remittanceReference: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────

export interface PayrollMonthlyData {
  month: number;
  monthLabel: string;
  grossPay: number;
  netPay: number;
  deductions: number;
  employees: number;
}

export interface PayrollDashboard {
  year: number;
  totalPayrollRuns: number;
  completedRuns: number;
  latestRun: PayrollRun | null;
  ytd: {
    grossPay: number;
    netPay: number;
    deductions: number;
    paye: number;
    pension: number;
  };
  monthlyData: PayrollMonthlyData[];
}

// ─── Payloads ───────────────────────────────────────────────────────

export interface CreatePayrollRunPayload {
  month: number;
  year: number;
  runType?: PayrollRunType;
  bonusPercent?: number;
  notes?: string;
}

export interface UpdatePayslipAdjustmentsPayload {
  overtimePay?: number;
  bonuses?: number;
  otherDeductions?: number;
}

export interface CreateTaxFilingPayload {
  taxType: TaxType;
  month?: number;
  year: number;
  totalEmployees: number;
  grossPayroll: number;
  taxAmount: number;
  dueDate?: string;
  notes?: string;
}

export interface PayrollRunQueryParams {
  year?: number;
  status?: PayrollRunStatus;
  page?: number;
  limit?: number;
}

export interface PayslipQueryParams {
  payrollRunId?: string;
  employeeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaxFilingQueryParams {
  taxType?: TaxType;
  status?: TaxFilingStatus;
  year?: number;
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

// ─── Reports ────────────────────────────────────────────────────────

export interface PayrollReportRun { id: string; month: number; year: number; status: string; }

export interface PayrollRegisterRow {
  employeeName: string; staffId: string; department: string | null; jobTitle: string | null;
  gross: number; basic: number; allowances: number; overtime: number; bonuses: number;
  paye: number; pension: number; nhf: number; nhis: number; otherDeductions: number;
  totalDeductions: number; netPay: number;
}
export interface PayrollRegister {
  run: PayrollReportRun;
  rows: PayrollRegisterRow[];
  totals: { gross: number; allowances: number; paye: number; pension: number; nhf: number; nhis: number; otherDeductions: number; totalDeductions: number; netPay: number; count: number };
}

export interface StatutorySummaryItem { label: string; authority: string; employee: number; employer: number; total: number; }
export interface StatutorySummary {
  run: PayrollReportRun & { employees: number };
  items: StatutorySummaryItem[];
  totalRemittable: number;
}

export interface BankScheduleRow { employeeName: string; staffId: string; bankName: string | null; accountNumber: string | null; accountName: string | null; amount: number; }
export interface BankSchedule {
  run: PayrollReportRun;
  rows: BankScheduleRow[];
  totalNetPay: number;
  count: number;
}

// ─── Salary structure (configurable earning split) ───────────────────────────

export interface SalaryStructure {
  id: string;
  basicPercent: number;
  housingPercent: number;
  transportPercent: number;
  otherPercent: number;
  housingPensionable: boolean;
  transportPensionable: boolean;
  otherPensionable: boolean;
  updatedBy: string | null;
  updatedAt: string;
}

export interface UpdateSalaryStructurePayload {
  basicPercent: number;
  housingPercent: number;
  transportPercent: number;
  otherPercent: number;
  housingPensionable: boolean;
  transportPensionable: boolean;
  otherPensionable: boolean;
}

// ─── Payroll adjustments (back-pay / bonus / allowance / deduction) ──────────

export type PayrollAdjustmentType = "back_pay" | "bonus" | "allowance" | "deduction";
export type PayrollAdjustmentStatus = "pending" | "applied" | "cancelled";

export interface PayrollAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  type: PayrollAdjustmentType;
  amount: number;
  reason: string | null;
  status: PayrollAdjustmentStatus;
  payrollRunId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollAdjustmentPayload {
  employeeId: string;
  month: number;
  year: number;
  type: PayrollAdjustmentType;
  amount: number;
  reason?: string;
}

export interface PayrollAdjustmentQueryParams {
  month?: number;
  year?: number;
  status?: PayrollAdjustmentStatus;
  employeeId?: string;
}
