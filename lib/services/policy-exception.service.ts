import { apiClient } from "../api/client";
import type {
  PolicyException,
  RequestPolicyExceptionPayload,
  DecidePolicyExceptionPayload,
} from "../types/policy-exception";

const PATH = "/policy-exceptions";

export const policyExceptionService = {
  // ─── Employee self-service ──────────────────────────────────────────────────
  getMine(): Promise<PolicyException[]> {
    return apiClient.get<PolicyException[]>(`${PATH}/mine`);
  },
  request(data: RequestPolicyExceptionPayload): Promise<PolicyException> {
    return apiClient.post<PolicyException>(PATH, data);
  },
  uploadEvidence(id: string, file: File): Promise<PolicyException> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<PolicyException>(`${PATH}/${id}/file`, formData);
  },
  downloadUrl(id: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`${PATH}/${id}/download`);
  },

  // ─── HR ─────────────────────────────────────────────────────────────────────
  getAll(params?: { status?: string; policyId?: string }): Promise<PolicyException[]> {
    return apiClient.get<PolicyException[]>(PATH, params as Record<string, string | undefined>);
  },
  approve(id: string, data: DecidePolicyExceptionPayload): Promise<PolicyException> {
    return apiClient.patch<PolicyException>(`${PATH}/${id}/approve`, data);
  },
  reject(id: string, data: DecidePolicyExceptionPayload): Promise<PolicyException> {
    return apiClient.patch<PolicyException>(`${PATH}/${id}/reject`, data);
  },
  revoke(id: string, data: DecidePolicyExceptionPayload): Promise<PolicyException> {
    return apiClient.patch<PolicyException>(`${PATH}/${id}/revoke`, data);
  },
};
