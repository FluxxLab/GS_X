import type { Employee } from './employee';

export type ContractType = 'permanent' | 'fixed_term' | 'probationary' | 'contract';
export type ContractStatus = 'active' | 'expired' | 'terminated' | 'renewed' | 'pending_renewal';

export interface Contract {
  id: string;
  employeeId: string;
  employee?: Employee;
  offerId: string | null;
  contractNumber: string;
  contractType: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string | null;
  probationEndDate: string | null;
  noticePeriodDays: number;
  grossAnnualSalary: number;
  salaryBreakdown: Record<string, number> | null;
  jobTitle: string;
  departmentId: string | null;
  jobLevel: string | null;
  employmentType: string;
  notes: string | null;
  terminationDate: string | null;
  terminationReason: string | null;
  renewedFromContractId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  amendments?: ContractAmendment[];
}

export interface ContractAmendment {
  id: string;
  contractId: string;
  amendmentDate: string;
  amendmentType: string;
  description: string;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  effectiveDate: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractStats {
  total: number;
  active: number;
  expired: number;
  terminated: number;
  expiringSoon: number;
  probationEndingSoon: number;
}

export interface CreateContractPayload {
  employeeId: string;
  contractType?: ContractType;
  startDate: string;
  endDate?: string;
  probationEndDate?: string;
  noticePeriodDays?: number;
  grossAnnualSalary: number;
  jobTitle: string;
  departmentId?: string;
  jobLevel?: string;
  employmentType?: string;
  notes?: string;
}

export interface TerminateContractPayload {
  terminationDate: string;
  terminationReason?: string;
}

export interface RenewContractPayload {
  newStartDate: string;
  newEndDate?: string;
  newGrossAnnualSalary?: number;
  notes?: string;
}

export interface CreateAmendmentPayload {
  amendmentType: string;
  description: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  effectiveDate: string;
}

export interface ContractQueryParams {
  employeeId?: string;
  status?: ContractStatus;
  contractType?: ContractType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
