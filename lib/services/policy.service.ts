import { apiClient } from "../api/client";
import type {
  Policy,
  PolicyDetail,
  PolicyApproval,
  PolicyCompliance,
  MyPolicy,
  CreatePolicyPayload,
  UpdatePolicyPayload,
  NewPolicyVersionPayload,
  PolicyReference,
  AddPolicyReferencePayload,
  DanglingReference,
} from "../types/policy";

const PATH = "/policies";

export const policyService = {
  // ─── Employee self-service ──────────────────────────────────────────────────
  getMine(): Promise<MyPolicy[]> {
    return apiClient.get<MyPolicy[]>(`${PATH}/mine`);
  },
  acknowledge(id: string): Promise<void> {
    return apiClient.post<void>(`${PATH}/${id}/acknowledge`, {});
  },

  // ─── Library ────────────────────────────────────────────────────────────────
  getAll(params?: { status?: string; category?: string }): Promise<Policy[]> {
    return apiClient.get<Policy[]>(PATH, params as Record<string, string | undefined>);
  },
  getOne(id: string): Promise<PolicyDetail> {
    return apiClient.get<PolicyDetail>(`${PATH}/${id}`);
  },
  create(data: CreatePolicyPayload): Promise<Policy> {
    return apiClient.post<Policy>(PATH, data);
  },
  update(id: string, data: UpdatePolicyPayload): Promise<Policy> {
    return apiClient.patch<Policy>(`${PATH}/${id}`, data);
  },

  // ─── Document ───────────────────────────────────────────────────────────────
  uploadFile(id: string, file: File): Promise<Policy> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<Policy>(`${PATH}/${id}/file`, formData);
  },
  /** Signed, time-limited URL. Pass `version` for a historical issue. */
  downloadUrl(id: string, version?: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`${PATH}/${id}/download`, version ? { version } : undefined);
  },

  // ─── Approval → publish ─────────────────────────────────────────────────────
  submit(id: string): Promise<Policy> {
    return apiClient.post<Policy>(`${PATH}/${id}/submit`, {});
  },
  approveStep(id: string, approvalId: string, note?: string): Promise<PolicyApproval> {
    return apiClient.post<PolicyApproval>(`${PATH}/${id}/approvals/${approvalId}/approve`, { note });
  },
  rejectStep(id: string, approvalId: string, note?: string): Promise<PolicyApproval> {
    return apiClient.post<PolicyApproval>(`${PATH}/${id}/approvals/${approvalId}/reject`, { note });
  },
  publish(id: string): Promise<Policy> {
    return apiClient.post<Policy>(`${PATH}/${id}/publish`, {});
  },
  newVersion(id: string, data: NewPolicyVersionPayload): Promise<Policy> {
    return apiClient.post<Policy>(`${PATH}/${id}/versions`, data);
  },
  archive(id: string): Promise<Policy> {
    return apiClient.post<Policy>(`${PATH}/${id}/archive`, {});
  },
  compliance(id: string): Promise<PolicyCompliance> {
    return apiClient.get<PolicyCompliance>(`${PATH}/${id}/compliance`);
  },

  // ─── Cross-references ───────────────────────────────────────────────────────
  addReference(id: string, data: AddPolicyReferencePayload): Promise<PolicyReference> {
    return apiClient.post<PolicyReference>(`${PATH}/${id}/references`, data);
  },
  removeReference(id: string, referenceId: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/${id}/references/${referenceId}`);
  },
  /** Citations pointing at policies nobody has written. */
  danglingReferences(): Promise<DanglingReference[]> {
    return apiClient.get<DanglingReference[]>(`${PATH}/dangling-references`);
  },
};
