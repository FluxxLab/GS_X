import { apiClient } from "../api/client";
import type {
  SalesReport,
  CreateSalesReportPayload,
  UpdateSalesReportPayload,
  SalesReportQueryParams,
  PaginatedResponse,
} from "../types/sales";

const PATH = "/sales/reports";

type QueryRecord = Record<string, string | number | boolean | undefined>;

export const salesService = {
  getReports(
    params?: SalesReportQueryParams,
  ): Promise<PaginatedResponse<SalesReport>> {
    return apiClient.get<PaginatedResponse<SalesReport>>(
      PATH,
      params as QueryRecord,
    );
  },

  getReport(id: string): Promise<SalesReport> {
    return apiClient.get<SalesReport>(`${PATH}/${id}`);
  },

  getMyReports(): Promise<SalesReport[]> {
    return apiClient.get<SalesReport[]>(`${PATH}/mine`);
  },

  createReport(data: CreateSalesReportPayload): Promise<SalesReport> {
    return apiClient.post<SalesReport>(PATH, data);
  },

  updateReport(
    id: string,
    data: UpdateSalesReportPayload,
  ): Promise<SalesReport> {
    return apiClient.patch<SalesReport>(`${PATH}/${id}`, data);
  },

  submitReport(id: string): Promise<SalesReport> {
    return apiClient.patch<SalesReport>(`${PATH}/${id}/submit`);
  },

  approveReport(id: string): Promise<SalesReport> {
    return apiClient.patch<SalesReport>(`${PATH}/${id}/approve`);
  },

  rejectReport(id: string, reason: string): Promise<SalesReport> {
    return apiClient.patch<SalesReport>(`${PATH}/${id}/reject`, { reason });
  },

  deleteReport(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/${id}`);
  },
};
