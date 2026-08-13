import { apiClient } from "../api/client";
import type {
  EmployeeTransfer,
  CreateEmployeeTransferPayload,
  EmployeeTransferQueryParams,
} from "../types/employee-transfer";

const PATH = "/employee-transfers";

export const employeeTransferService = {
  getAll(params?: EmployeeTransferQueryParams): Promise<EmployeeTransfer[]> {
    return apiClient.get<EmployeeTransfer[]>(
      PATH,
      params as Record<string, string | number | boolean | undefined>,
    );
  },
  getEmployeeHistory(employeeId: string): Promise<EmployeeTransfer[]> {
    return apiClient.get<EmployeeTransfer[]>(`${PATH}/employee/${employeeId}`);
  },
  create(data: CreateEmployeeTransferPayload): Promise<EmployeeTransfer> {
    return apiClient.post<EmployeeTransfer>(PATH, data);
  },
  approve(id: string): Promise<EmployeeTransfer> {
    return apiClient.patch<EmployeeTransfer>(`${PATH}/${id}/approve`);
  },
  reject(id: string): Promise<EmployeeTransfer> {
    return apiClient.patch<EmployeeTransfer>(`${PATH}/${id}/reject`);
  },
  cancel(id: string): Promise<EmployeeTransfer> {
    return apiClient.patch<EmployeeTransfer>(`${PATH}/${id}/cancel`);
  },
};
