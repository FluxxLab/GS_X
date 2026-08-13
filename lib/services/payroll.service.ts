import { apiClient } from '../api/client';
import type {
  PayrollRun,
  Payslip,
  TaxFiling,
  PayrollDashboard,
  CreatePayrollRunPayload,
  UpdatePayslipAdjustmentsPayload,
  CreateTaxFilingPayload,
  PayrollRunQueryParams,
  PayslipQueryParams,
  TaxFilingQueryParams,
  PaginatedResponse,
  PayrollRegister,
  StatutorySummary,
  BankSchedule,
  SalaryStructure,
  UpdateSalaryStructurePayload,
  PayrollAdjustment,
  CreatePayrollAdjustmentPayload,
  PayrollAdjustmentQueryParams,
} from '../types/payroll';

const PATH = '/payroll';

export const payrollService = {
  // ─── Payroll Runs ──────────────────────────────────────────────────

  createRun(data: CreatePayrollRunPayload): Promise<PayrollRun> {
    return apiClient.post<PayrollRun>(`${PATH}/runs`, data);
  },

  getRuns(params?: PayrollRunQueryParams): Promise<PaginatedResponse<PayrollRun>> {
    return apiClient.get<PaginatedResponse<PayrollRun>>(
      `${PATH}/runs`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getRun(id: string): Promise<PayrollRun> {
    return apiClient.get<PayrollRun>(`${PATH}/runs/${id}`);
  },

  calculateRun(id: string): Promise<PayrollRun> {
    return apiClient.post<PayrollRun>(`${PATH}/runs/${id}/calculate`);
  },

  approveRun(id: string): Promise<PayrollRun> {
    return apiClient.patch<PayrollRun>(`${PATH}/runs/${id}/approve`);
  },

  processRun(id: string): Promise<PayrollRun> {
    return apiClient.patch<PayrollRun>(`${PATH}/runs/${id}/process`);
  },

  cancelRun(id: string): Promise<PayrollRun> {
    return apiClient.patch<PayrollRun>(`${PATH}/runs/${id}/cancel`);
  },

  generateFilings(runId: string): Promise<TaxFiling[]> {
    return apiClient.post<TaxFiling[]>(`${PATH}/runs/${runId}/generate-filings`);
  },

  // ─── Salary structure (configurable earning split) ─────────────────

  getSalaryStructure(): Promise<SalaryStructure> {
    return apiClient.get<SalaryStructure>(`${PATH}/salary-structure`);
  },
  updateSalaryStructure(data: UpdateSalaryStructurePayload): Promise<SalaryStructure> {
    return apiClient.patch<SalaryStructure>(`${PATH}/salary-structure`, data);
  },

  // ─── Adjustments (back-pay / bonus / deduction) ────────────────────

  getAdjustments(params?: PayrollAdjustmentQueryParams): Promise<PayrollAdjustment[]> {
    return apiClient.get<PayrollAdjustment[]>(
      `${PATH}/adjustments`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },
  createAdjustment(data: CreatePayrollAdjustmentPayload): Promise<PayrollAdjustment> {
    return apiClient.post<PayrollAdjustment>(`${PATH}/adjustments`, data);
  },
  cancelAdjustment(id: string): Promise<PayrollAdjustment> {
    return apiClient.patch<PayrollAdjustment>(`${PATH}/adjustments/${id}/cancel`);
  },

  // ─── Reports ───────────────────────────────────────────────────────

  getPayrollRegister(runId: string): Promise<PayrollRegister> {
    return apiClient.get<PayrollRegister>(`${PATH}/runs/${runId}/register`);
  },
  getStatutorySummary(runId: string): Promise<StatutorySummary> {
    return apiClient.get<StatutorySummary>(`${PATH}/runs/${runId}/statutory-summary`);
  },
  getBankSchedule(runId: string): Promise<BankSchedule> {
    return apiClient.get<BankSchedule>(`${PATH}/runs/${runId}/bank-schedule`);
  },

  // ─── Employee self-service ─────────────────────────────────────────

  getMyPayslips(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Payslip>> {
    return apiClient.get<PaginatedResponse<Payslip>>(
      `${PATH}/my/payslips`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },
  downloadMyPayslip(id: string): Promise<Blob> {
    return apiClient.getBlob(`${PATH}/my/payslips/${id}/download`);
  },

  // ─── Payslips ──────────────────────────────────────────────────────

  getPayslips(params?: PayslipQueryParams): Promise<PaginatedResponse<Payslip>> {
    return apiClient.get<PaginatedResponse<Payslip>>(
      `${PATH}/payslips`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getPayslip(id: string): Promise<Payslip> {
    return apiClient.get<Payslip>(`${PATH}/payslips/${id}`);
  },

  downloadPayslip(id: string): Promise<Blob> {
    return apiClient.getBlob(`${PATH}/payslips/${id}/download`);
  },

  updatePayslipAdjustments(id: string, data: UpdatePayslipAdjustmentsPayload): Promise<Payslip> {
    return apiClient.patch<Payslip>(`${PATH}/payslips/${id}/adjustments`, data);
  },

  getEmployeePayslips(employeeId: string, page = 1, limit = 12): Promise<PaginatedResponse<Payslip>> {
    return apiClient.get<PaginatedResponse<Payslip>>(
      `${PATH}/employee/${employeeId}/payslips`,
      { page, limit },
    );
  },

  // ─── Tax Filings ──────────────────────────────────────────────────

  createTaxFiling(data: CreateTaxFilingPayload): Promise<TaxFiling> {
    return apiClient.post<TaxFiling>(`${PATH}/tax-filings`, data);
  },

  getTaxFilings(params?: TaxFilingQueryParams): Promise<PaginatedResponse<TaxFiling>> {
    return apiClient.get<PaginatedResponse<TaxFiling>>(
      `${PATH}/tax-filings`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getTaxFiling(id: string): Promise<TaxFiling> {
    return apiClient.get<TaxFiling>(`${PATH}/tax-filings/${id}`);
  },

  submitTaxFiling(id: string): Promise<TaxFiling> {
    return apiClient.patch<TaxFiling>(`${PATH}/tax-filings/${id}/submit`);
  },

  markTaxFilingRemitted(id: string, remittanceReference?: string): Promise<TaxFiling> {
    return apiClient.patch<TaxFiling>(`${PATH}/tax-filings/${id}/remit`, { remittanceReference });
  },

  // ─── Dashboard ────────────────────────────────────────────────────

  getDashboard(year?: number): Promise<PayrollDashboard> {
    return apiClient.get<PayrollDashboard>(
      `${PATH}/dashboard`,
      year ? { year } : undefined,
    );
  },
};
