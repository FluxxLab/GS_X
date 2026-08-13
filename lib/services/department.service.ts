import { apiClient } from '../api/client';
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentQueryParams,
  PaginatedResponse,
  DepartmentStats,
} from '../types/department';

const PATH = '/departments';

export const departmentService = {
  getAll(params?: DepartmentQueryParams): Promise<PaginatedResponse<Department>> {
    return apiClient.get<PaginatedResponse<Department>>(PATH, params as Record<string, string | number | boolean | undefined>);
  },

  getById(id: string): Promise<Department> {
    return apiClient.get<Department>(`${PATH}/${id}`);
  },

  getStats(): Promise<DepartmentStats> {
    return apiClient.get<DepartmentStats>(`${PATH}/stats`);
  },

  create(data: CreateDepartmentPayload): Promise<Department> {
    return apiClient.post<Department>(PATH, data);
  },

  update(id: string, data: UpdateDepartmentPayload): Promise<Department> {
    return apiClient.patch<Department>(`${PATH}/${id}`, data);
  },

  deactivate(id: string): Promise<Department> {
    return apiClient.delete<Department>(`${PATH}/${id}`);
  },
};
