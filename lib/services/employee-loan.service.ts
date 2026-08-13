import { apiClient } from "../api/client";
import type {
  EmployeeLoan,
  EmployeeLoanWithSchedule,
  CreateEmployeeLoanPayload,
  EmployeeLoanQueryParams,
} from "../types/employee-loan";

const PATH = "/employee-loans";

export const employeeLoanService = {
  getAll(params?: EmployeeLoanQueryParams): Promise<EmployeeLoan[]> {
    return apiClient.get<EmployeeLoan[]>(
      PATH,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getOne(id: string): Promise<EmployeeLoanWithSchedule> {
    return apiClient.get<EmployeeLoanWithSchedule>(`${PATH}/${id}`);
  },

  create(data: CreateEmployeeLoanPayload): Promise<EmployeeLoan> {
    return apiClient.post<EmployeeLoan>(PATH, data);
  },

  approve(id: string): Promise<EmployeeLoan> {
    return apiClient.patch<EmployeeLoan>(`${PATH}/${id}/approve`);
  },

  reject(id: string): Promise<EmployeeLoan> {
    return apiClient.patch<EmployeeLoan>(`${PATH}/${id}/reject`);
  },

  cancel(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/${id}`);
  },

  // ─── Self-service ─────────────────────────────────────────────────────────────

  getMine(): Promise<EmployeeLoan[]> {
    return apiClient.get<EmployeeLoan[]>(`${PATH}/my`);
  },
};
