import { apiClient } from "../api/client";
import type {
  Timesheet,
  SubmitTimesheetPayload,
  TimesheetQueryParams,
} from "../types/timesheet";

const PATH = "/timesheets";

export const timesheetService = {
  // Self-service
  submitMine(data: SubmitTimesheetPayload): Promise<Timesheet> {
    return apiClient.post<Timesheet>(`${PATH}/my/submit`, data);
  },
  getMine(): Promise<Timesheet[]> {
    return apiClient.get<Timesheet[]>(`${PATH}/my`);
  },

  // Admin / manager
  getAll(params?: TimesheetQueryParams): Promise<Timesheet[]> {
    return apiClient.get<Timesheet[]>(
      PATH,
      params as Record<string, string | number | boolean | undefined>,
    );
  },
  approve(id: string, reviewNote?: string): Promise<Timesheet> {
    return apiClient.patch<Timesheet>(`${PATH}/${id}/approve`, { reviewNote });
  },
  reject(id: string, reviewNote?: string): Promise<Timesheet> {
    return apiClient.patch<Timesheet>(`${PATH}/${id}/reject`, { reviewNote });
  },
};
