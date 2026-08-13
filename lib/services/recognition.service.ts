import { apiClient } from "../api/client";
import type {
  Recognition,
  NominateRecognitionPayload,
  DecideRecognitionPayload,
  ValueBreakdownRow,
} from "../types/recognition";

const PATH = "/recognitions";

export const recognitionService = {
  // ─── Open to everyone ───────────────────────────────────────────────────────
  /** Approved + public awards only — never exposes a pending nomination. */
  wall(limit = 50): Promise<Recognition[]> {
    return apiClient.get<Recognition[]>(`${PATH}/wall`, { limit: String(limit) });
  },
  getMine(): Promise<Recognition[]> {
    return apiClient.get<Recognition[]>(`${PATH}/mine`);
  },
  nominate(data: NominateRecognitionPayload): Promise<Recognition> {
    return apiClient.post<Recognition>(PATH, data);
  },

  // ─── HR ─────────────────────────────────────────────────────────────────────
  getAll(params?: { status?: string; type?: string; period?: string }): Promise<Recognition[]> {
    return apiClient.get<Recognition[]>(PATH, params as Record<string, string | undefined>);
  },
  valueBreakdown(): Promise<ValueBreakdownRow[]> {
    return apiClient.get<ValueBreakdownRow[]>(`${PATH}/value-breakdown`);
  },
  approve(id: string, data: DecideRecognitionPayload): Promise<Recognition> {
    return apiClient.patch<Recognition>(`${PATH}/${id}/approve`, data);
  },
  reject(id: string, data: DecideRecognitionPayload): Promise<Recognition> {
    return apiClient.patch<Recognition>(`${PATH}/${id}/reject`, data);
  },
};
