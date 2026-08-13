import { apiClient } from '../api/client';
import type {
  Task, Kpi, TaskStats, EmployeePerformance,
  CreateTaskPayload, UpdateTaskPayload,
  CreateKpiPayload, UpdateKpiPayload,
  PaginatedResponse,
} from '../types/performance';

const PATH = '/performance';

export const performanceService = {
  // ─── Tasks ─────────────────────────────────────────────────────────

  createTask(data: CreateTaskPayload): Promise<Task> {
    return apiClient.post<Task>(`${PATH}/tasks`, data);
  },

  getTasks(params?: Record<string, string | number | boolean | undefined>): Promise<PaginatedResponse<Task>> {
    return apiClient.get<PaginatedResponse<Task>>(`${PATH}/tasks`, params);
  },

  getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`${PATH}/tasks/${id}`);
  },

  updateTask(id: string, data: UpdateTaskPayload): Promise<Task> {
    return apiClient.patch<Task>(`${PATH}/tasks/${id}`, data);
  },

  deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/tasks/${id}`);
  },

  submitTask(id: string, evidence: string): Promise<Task> {
    return apiClient.patch<Task>(`${PATH}/tasks/${id}/submit`, { evidence });
  },

  verifyTask(id: string): Promise<Task> {
    return apiClient.patch<Task>(`${PATH}/tasks/${id}/verify`);
  },

  rejectTask(id: string, reason: string): Promise<Task> {
    return apiClient.patch<Task>(`${PATH}/tasks/${id}/reject`, { reason });
  },

  getTaskStats(employeeId?: string): Promise<TaskStats> {
    return apiClient.get<TaskStats>(`${PATH}/tasks/stats`, employeeId ? { employeeId } : undefined);
  },

  // ─── KPIs ──────────────────────────────────────────────────────────

  createKpi(data: CreateKpiPayload): Promise<Kpi> {
    return apiClient.post<Kpi>(`${PATH}/kpis`, data);
  },

  getKpis(params?: Record<string, string | number | boolean | undefined>): Promise<PaginatedResponse<Kpi>> {
    return apiClient.get<PaginatedResponse<Kpi>>(`${PATH}/kpis`, params);
  },

  getKpi(id: string): Promise<Kpi> {
    return apiClient.get<Kpi>(`${PATH}/kpis/${id}`);
  },

  updateKpi(id: string, data: UpdateKpiPayload): Promise<Kpi> {
    return apiClient.patch<Kpi>(`${PATH}/kpis/${id}`, data);
  },

  deleteKpi(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/kpis/${id}`);
  },

  // ─── Performance Score ─────────────────────────────────────────────

  getEmployeePerformance(employeeId: string, quarter?: string, year?: number): Promise<EmployeePerformance> {
    return apiClient.get<EmployeePerformance>(`${PATH}/score/${employeeId}`, { quarter, year });
  },
};
