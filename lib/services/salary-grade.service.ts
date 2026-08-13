import { apiClient } from '../api/client';
import type { SalaryGrade, SalaryStep, CreateSalaryGradePayload, UpdateSalaryGradePayload } from '../types/salary-grade';

const PATH = '/salary-grades';

export const salaryGradeService = {
  getAll(params?: Record<string, string | number | boolean | undefined>) {
    return apiClient.get<{ data: SalaryGrade[]; total: number; page: number; limit: number; totalPages: number }>(PATH, params);
  },
  getById(id: string) {
    return apiClient.get<SalaryGrade>(`${PATH}/${id}`);
  },
  getSteps(id: string) {
    return apiClient.get<SalaryStep[]>(`${PATH}/${id}/steps`);
  },
  create(data: CreateSalaryGradePayload) {
    return apiClient.post<SalaryGrade>(PATH, data);
  },
  update(id: string, data: UpdateSalaryGradePayload) {
    return apiClient.patch<SalaryGrade>(`${PATH}/${id}`, data);
  },
  delete(id: string) {
    return apiClient.delete<void>(`${PATH}/${id}`);
  },
};
