import { apiClient } from "../api/client";
import type {
  TravelRequest,
  CreateTravelRequestPayload,
  TravelListResponse,
  PerDiemRate,
  CreatePerDiemRatePayload,
  UpdatePerDiemRatePayload,
  SubmitRetirementPayload,
  BookTravelPayload,
  TravelAttachment,
} from "../types/travel";

const PATH = "/operations/travel/requests";
const RATES_PATH = "/operations/travel/per-diem-rates";

export const travelService = {
  /** Admin/finance — all requests (approver roles only). */
  list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<TravelListResponse> {
    return apiClient.get<TravelListResponse>(PATH, params);
  },

  /** Reports page: SQL-aggregated stats + filtered rows (server does the
   *  status/date filtering and the totals, so they're correct at any volume). */
  reportSummary(params?: { status?: string; from?: string; to?: string }): Promise<{
    stats: { count: number; settled: number; spend: number };
    rows: TravelRequest[];
  }> {
    return apiClient.get(`${PATH}/report-summary`, params);
  },

  /** My Workspace — the requests I raised. */
  mine(): Promise<TravelRequest[]> {
    return apiClient.get<TravelRequest[]>(`${PATH}/mine`);
  },

  getOne(id: string): Promise<TravelRequest> {
    return apiClient.get<TravelRequest>(`${PATH}/${id}`);
  },

  create(payload: CreateTravelRequestPayload): Promise<TravelRequest> {
    return apiClient.post<TravelRequest>(PATH, payload);
  },

  update(
    id: string,
    payload: Partial<CreateTravelRequestPayload>,
  ): Promise<TravelRequest> {
    return apiClient.patch<TravelRequest>(`${PATH}/${id}`, payload);
  },

  approve(id: string): Promise<TravelRequest> {
    return apiClient.patch<TravelRequest>(`${PATH}/${id}/approve`, {});
  },

  reject(id: string, reason: string): Promise<TravelRequest> {
    return apiClient.patch<TravelRequest>(`${PATH}/${id}/reject`, { reason });
  },

  cancel(id: string): Promise<TravelRequest> {
    return apiClient.patch<TravelRequest>(`${PATH}/${id}/cancel`, {});
  },

  retire(
    id: string,
    payload: SubmitRetirementPayload,
  ): Promise<TravelRequest> {
    return apiClient.patch<TravelRequest>(`${PATH}/${id}/retire`, payload);
  },

  settleRetirement(id: string): Promise<TravelRequest> {
    return apiClient.patch<TravelRequest>(
      `${PATH}/${id}/retirement/settle`,
      {},
    );
  },

  book(id: string, payload: BookTravelPayload): Promise<TravelRequest> {
    return apiClient.patch<TravelRequest>(`${PATH}/${id}/book`, payload);
  },

  // ── Attachments ──────────────────────────────────────────

  listAttachments(id: string): Promise<TravelAttachment[]> {
    return apiClient.get<TravelAttachment[]>(`${PATH}/${id}/attachments`);
  },

  uploadAttachment(
    id: string,
    file: File,
    kind?: string,
    caption?: string,
  ): Promise<TravelAttachment> {
    const form = new FormData();
    form.append("file", file);
    if (kind) form.append("kind", kind);
    if (caption) form.append("caption", caption);
    return apiClient.upload<TravelAttachment>(`${PATH}/${id}/attachments`, form);
  },

  attachmentDownloadUrl(attId: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(
      `/operations/travel/attachments/${attId}/download`,
    );
  },

  deleteAttachment(attId: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(
      `/operations/travel/attachments/${attId}`,
    );
  },

  // ── Per-diem rate configuration ──────────────────────────

  /** Active rates (form) by default; pass all=true for the admin list. */
  listRates(params?: { all?: boolean; travelType?: string }): Promise<
    PerDiemRate[]
  > {
    return apiClient.get<PerDiemRate[]>(RATES_PATH, {
      all: params?.all ? "true" : undefined,
      travelType: params?.travelType,
    });
  },

  /** Best per-diem rate for the logged-in user on a trip type (null if none). */
  suggestedRate(travelType: string): Promise<PerDiemRate | null> {
    return apiClient.get<PerDiemRate | null>(`${RATES_PATH}/suggested`, {
      travelType,
    });
  },

  createRate(payload: CreatePerDiemRatePayload): Promise<PerDiemRate> {
    return apiClient.post<PerDiemRate>(RATES_PATH, payload);
  },

  updateRate(
    id: string,
    payload: UpdatePerDiemRatePayload,
  ): Promise<PerDiemRate> {
    return apiClient.patch<PerDiemRate>(`${RATES_PATH}/${id}`, payload);
  },

  deleteRate(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`${RATES_PATH}/${id}`);
  },
};
