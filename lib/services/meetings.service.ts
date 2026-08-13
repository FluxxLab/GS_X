import { apiClient } from "../api/client";
import type { Meeting, CreateMeetingPayload } from "../types/meetings";

const PATH = "/meetings";

export const meetingsService = {
  list(params?: { linkedType?: string; linkedId?: string }): Promise<Meeting[]> {
    return apiClient.get<Meeting[]>(PATH, params);
  },

  getOne(id: string): Promise<Meeting> {
    return apiClient.get<Meeting>(`${PATH}/${id}`);
  },

  create(payload: CreateMeetingPayload): Promise<Meeting> {
    return apiClient.post<Meeting>(PATH, payload);
  },

  cancel(id: string): Promise<Meeting> {
    return apiClient.patch<Meeting>(`${PATH}/${id}/cancel`, {});
  },
};
