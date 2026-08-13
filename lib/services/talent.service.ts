import { apiClient } from "../api/client";
import type {
  Interview,
  ScheduleInterviewPayload,
  InterviewFeedbackPayload,
  ReferenceCheck,
  CreateReferencePayload,
  Appraisal,
  CreateAppraisalPayload,
  SelfReviewPayload,
  ManagerReviewPayload,
  CoreValue,
} from "../types/talent";

const PATH = "/talent";

export const talentService = {
  /** The rating rubric — definitions + the §6 decision question per value. */
  getCoreValues(): Promise<CoreValue[]> {
    return apiClient.get<CoreValue[]>(`${PATH}/core-values`);
  },

  // Interviews
  listInterviews(candidateId?: string): Promise<Interview[]> {
    return apiClient.get<Interview[]>(`${PATH}/interviews`, candidateId ? { candidateId } : undefined);
  },
  scheduleInterview(data: ScheduleInterviewPayload): Promise<Interview> {
    return apiClient.post<Interview>(`${PATH}/interviews`, data);
  },
  interviewFeedback(id: string, data: InterviewFeedbackPayload): Promise<Interview> {
    return apiClient.patch<Interview>(`${PATH}/interviews/${id}/feedback`, data);
  },

  // References
  listReferences(candidateId?: string): Promise<ReferenceCheck[]> {
    return apiClient.get<ReferenceCheck[]>(`${PATH}/references`, candidateId ? { candidateId } : undefined);
  },
  createReference(data: CreateReferencePayload): Promise<ReferenceCheck> {
    return apiClient.post<ReferenceCheck>(`${PATH}/references`, data);
  },
  referenceFeedback(id: string, data: { status?: string; rating?: number; feedback?: string; wouldRehire?: boolean }): Promise<ReferenceCheck> {
    return apiClient.patch<ReferenceCheck>(`${PATH}/references/${id}/feedback`, data);
  },

  getTimeToHire(): Promise<{ avgDays: number | null; hired: number }> {
    return apiClient.get<{ avgDays: number | null; hired: number }>(`${PATH}/time-to-hire`);
  },

  // Appraisals
  listAppraisals(params?: { status?: string; cycle?: string; employeeId?: string }): Promise<Appraisal[]> {
    return apiClient.get<Appraisal[]>(`${PATH}/appraisals`, params as Record<string, string | undefined>);
  },
  getAppraisal(id: string): Promise<Appraisal> {
    return apiClient.get<Appraisal>(`${PATH}/appraisals/${id}`);
  },
  createAppraisal(data: CreateAppraisalPayload): Promise<Appraisal> {
    return apiClient.post<Appraisal>(`${PATH}/appraisals`, data);
  },
  selfReview(id: string, data: SelfReviewPayload): Promise<Appraisal> {
    return apiClient.patch<Appraisal>(`${PATH}/appraisals/${id}/self-review`, data);
  },
  managerReview(id: string, data: ManagerReviewPayload): Promise<Appraisal> {
    return apiClient.patch<Appraisal>(`${PATH}/appraisals/${id}/manager-review`, data);
  },
  getMyAppraisals(): Promise<Appraisal[]> {
    return apiClient.get<Appraisal[]>(`${PATH}/my/appraisals`);
  },
};
