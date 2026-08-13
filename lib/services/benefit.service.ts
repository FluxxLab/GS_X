import { apiClient } from "../api/client";
import type {
  BenefitPlan,
  BenefitEnrollment,
  UpsertBenefitPlanPayload,
  CreateEnrollmentPayload,
} from "../types/benefit";

const PATH = "/benefits";

export const benefitService = {
  // Plans
  getPlans(activeOnly = false): Promise<BenefitPlan[]> {
    return apiClient.get<BenefitPlan[]>(`${PATH}/plans`, { activeOnly });
  },
  createPlan(data: UpsertBenefitPlanPayload): Promise<BenefitPlan> {
    return apiClient.post<BenefitPlan>(`${PATH}/plans`, data);
  },
  updatePlan(id: string, data: UpsertBenefitPlanPayload): Promise<BenefitPlan> {
    return apiClient.patch<BenefitPlan>(`${PATH}/plans/${id}`, data);
  },

  // Enrollments
  getEnrollments(params?: { status?: string; type?: string; employeeId?: string }): Promise<BenefitEnrollment[]> {
    return apiClient.get<BenefitEnrollment[]>(`${PATH}/enrollments`, params as Record<string, string | undefined>);
  },
  enroll(data: CreateEnrollmentPayload): Promise<BenefitEnrollment> {
    return apiClient.post<BenefitEnrollment>(`${PATH}/enrollments`, data);
  },
  terminate(id: string, endDate?: string): Promise<BenefitEnrollment> {
    return apiClient.patch<BenefitEnrollment>(`${PATH}/enrollments/${id}/terminate`, { endDate });
  },

  // Self-service
  getMine(): Promise<BenefitEnrollment[]> {
    return apiClient.get<BenefitEnrollment[]>(`${PATH}/my/enrollments`);
  },
};
