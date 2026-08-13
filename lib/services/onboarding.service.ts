import { apiClient } from '../api/client';
import type {
  Onboarding,
  OnboardingStats,
  OnboardingQueryParams,
} from '../types/onboarding';
import type { Employee, EmployeeDocument, PaginatedResponse } from '../types/employee';

export interface UpdateEmployeeDetailsResult {
  employee: Employee;
  markedItems: string[];
}

export interface GenerateEmailResult {
  email: string;
  employee: Employee;
}

export interface CreateErpAccountResult {
  user: Record<string, unknown>;
  password: string;
}

const PATH = '/onboarding';

export const onboardingService = {
  getAll(params?: OnboardingQueryParams): Promise<PaginatedResponse<Onboarding>> {
    return apiClient.get<PaginatedResponse<Onboarding>>(PATH, params as Record<string, string | number | boolean | undefined>);
  },

  getStats(): Promise<OnboardingStats> {
    return apiClient.get<OnboardingStats>(`${PATH}/stats`);
  },

  getById(id: string): Promise<Onboarding> {
    return apiClient.get<Onboarding>(`${PATH}/${id}`);
  },

  /** The logged-in user's own onboarding; null when they are not gated. */
  getMy(): Promise<Onboarding | null> {
    return apiClient.get<Onboarding | null>(`${PATH}/me`);
  },

  getByEmployeeId(employeeId: string): Promise<Onboarding> {
    return apiClient.get<Onboarding>(`${PATH}/employee/${employeeId}`);
  },

  updateItem(itemId: string, data: { isCompleted: boolean; notes?: string; completedBy?: string; assetId?: string }): Promise<void> {
    return apiClient.patch<void>(`${PATH}/items/${itemId}`, data);
  },

  complete(id: string, notes?: string): Promise<Onboarding> {
    return apiClient.post<Onboarding>(`${PATH}/${id}/complete`, { notes });
  },

  // ─── New Action Endpoints ─────────────────────────────────────────

  async uploadDocument(itemId: string, file: File): Promise<EmployeeDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<EmployeeDocument>(`${PATH}/items/${itemId}/upload-document`, formData);
  },

  updateEmployeeDetails(onboardingId: string, data: Record<string, unknown>): Promise<UpdateEmployeeDetailsResult> {
    return apiClient.patch<UpdateEmployeeDetailsResult>(`${PATH}/${onboardingId}/employee-details`, data);
  },

  generateEmail(onboardingId: string, emailPrefix: string): Promise<GenerateEmailResult> {
    return apiClient.post<GenerateEmailResult>(`${PATH}/${onboardingId}/generate-email`, { emailPrefix });
  },

  createErpAccount(onboardingId: string): Promise<CreateErpAccountResult> {
    return apiClient.post<CreateErpAccountResult>(`${PATH}/${onboardingId}/create-erp-account`, {});
  },

  assignSupervisor(onboardingId: string, managerId: string): Promise<Employee> {
    return apiClient.post<Employee>(`${PATH}/${onboardingId}/assign-supervisor`, { managerId });
  },
};
