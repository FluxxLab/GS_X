import { apiClient } from "../api/client";
import type {
  DisciplinaryCase,
  CreateDisciplinaryPayload,
  UpdateDisciplinaryPayload,
  GrievanceCase,
  CreateGrievancePayload,
  SelfCreateGrievancePayload,
  UpdateGrievancePayload,
} from "../types/hr-case";

const PATH = "/hr-cases";

export const hrCaseService = {
  // Disciplinary
  getDisciplinary(params?: { status?: string; employeeId?: string }): Promise<DisciplinaryCase[]> {
    return apiClient.get<DisciplinaryCase[]>(`${PATH}/disciplinary`, params as Record<string, string | undefined>);
  },
  createDisciplinary(data: CreateDisciplinaryPayload): Promise<DisciplinaryCase> {
    return apiClient.post<DisciplinaryCase>(`${PATH}/disciplinary`, data);
  },
  updateDisciplinary(id: string, data: UpdateDisciplinaryPayload): Promise<DisciplinaryCase> {
    return apiClient.patch<DisciplinaryCase>(`${PATH}/disciplinary/${id}`, data);
  },
  appealDisciplinary(id: string, appealNote: string): Promise<DisciplinaryCase> {
    return apiClient.patch<DisciplinaryCase>(`${PATH}/disciplinary/${id}/appeal`, { appealNote });
  },
  resolveAppeal(id: string, data: { appealOutcome: string; action?: string }): Promise<DisciplinaryCase> {
    return apiClient.patch<DisciplinaryCase>(`${PATH}/disciplinary/${id}/resolve-appeal`, data);
  },

  // Grievance
  getGrievances(params?: { status?: string; employeeId?: string }): Promise<GrievanceCase[]> {
    return apiClient.get<GrievanceCase[]>(`${PATH}/grievance`, params as Record<string, string | undefined>);
  },
  createGrievance(data: CreateGrievancePayload): Promise<GrievanceCase> {
    return apiClient.post<GrievanceCase>(`${PATH}/grievance`, data);
  },
  updateGrievance(id: string, data: UpdateGrievancePayload): Promise<GrievanceCase> {
    return apiClient.patch<GrievanceCase>(`${PATH}/grievance/${id}`, data);
  },

  // Self-service — the signed-in employee's own grievances.
  getMyGrievances(): Promise<GrievanceCase[]> {
    return apiClient.get<GrievanceCase[]>(`${PATH}/grievance/mine`);
  },
  createMyGrievance(data: SelfCreateGrievancePayload): Promise<GrievanceCase> {
    return apiClient.post<GrievanceCase>(`${PATH}/grievance/mine`, data);
  },
};
