import { apiClient } from '../api/client';
import type {
  Contract,
  ContractAmendment,
  ContractStats,
  CreateContractPayload,
  TerminateContractPayload,
  RenewContractPayload,
  CreateAmendmentPayload,
  ContractQueryParams,
  PaginatedResponse,
} from '../types/contract';

const PATH = '/contracts';

export const contractService = {
  getAll(params?: ContractQueryParams): Promise<PaginatedResponse<Contract>> {
    return apiClient.get<PaginatedResponse<Contract>>(PATH, params as Record<string, string | number | boolean | undefined>);
  },

  getById(id: string): Promise<Contract> {
    return apiClient.get<Contract>(`${PATH}/${id}`);
  },

  getByEmployee(employeeId: string): Promise<Contract[]> {
    return apiClient.get<Contract[]>(`${PATH}/employee/${employeeId}`);
  },

  getStats(): Promise<ContractStats> {
    return apiClient.get<ContractStats>(`${PATH}/stats`);
  },

  getExpiring(days = 30): Promise<Contract[]> {
    return apiClient.get<Contract[]>(`${PATH}/expiring`, { days });
  },

  getProbationsDue(days = 14): Promise<Contract[]> {
    return apiClient.get<Contract[]>(`${PATH}/probations-due`, { days });
  },

  runReminders(): Promise<{ expiring: number; probationsDue: number }> {
    return apiClient.post<{ expiring: number; probationsDue: number }>(`${PATH}/reminders/run`);
  },

  confirmProbation(id: string, data?: { confirmationDate?: string; note?: string }): Promise<Contract> {
    return apiClient.patch<Contract>(`${PATH}/${id}/confirm-probation`, data ?? {});
  },

  extendProbation(id: string, data: { probationEndDate: string; note?: string }): Promise<Contract> {
    return apiClient.patch<Contract>(`${PATH}/${id}/extend-probation`, data);
  },

  create(data: CreateContractPayload): Promise<Contract> {
    return apiClient.post<Contract>(PATH, data);
  },

  terminate(id: string, data: TerminateContractPayload): Promise<Contract> {
    return apiClient.patch<Contract>(`${PATH}/${id}/terminate`, data);
  },

  renew(id: string, data: RenewContractPayload): Promise<Contract> {
    return apiClient.post<Contract>(`${PATH}/${id}/renew`, data);
  },

  addAmendment(id: string, data: CreateAmendmentPayload): Promise<ContractAmendment> {
    return apiClient.post<ContractAmendment>(`${PATH}/${id}/amendments`, data);
  },

  getAmendments(id: string): Promise<ContractAmendment[]> {
    return apiClient.get<ContractAmendment[]>(`${PATH}/${id}/amendments`);
  },
};
