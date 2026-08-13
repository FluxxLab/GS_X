import { apiClient } from "../api/client";

export type RemittanceStatus = "pending" | "submitted" | "failed";

export interface RemittanceBatch {
  id: string;
  payrollRunId: string;
  period: string;
  taxType: string;
  authority: string;
  amount: number;
  status: RemittanceStatus;
  providerName: string | null;
  providerRef: string | null;
  error: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RemittanceProviderStatus {
  provider: string;
  configured: boolean;
}

const PATH = "/remittance";

export const remittanceService = {
  getStatus(): Promise<RemittanceProviderStatus> {
    return apiClient.get<RemittanceProviderStatus>(`${PATH}/status`);
  },
  listForRun(runId: string): Promise<RemittanceBatch[]> {
    return apiClient.get<RemittanceBatch[]>(`${PATH}/runs/${runId}`);
  },
  remit(runId: string): Promise<RemittanceBatch[]> {
    return apiClient.post<RemittanceBatch[]>(`${PATH}/runs/${runId}/remit`);
  },
};
