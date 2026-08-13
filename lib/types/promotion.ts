import type { Employee } from './employee';

export type PromotionStatus = 'pending' | 'approved' | 'rejected' | 'implemented';

export interface Promotion {
  id: string;
  employeeId: string;
  employee?: Employee;
  previousJobTitle: string;
  newJobTitle: string;
  previousJobLevel: string | null;
  newJobLevel: string | null;
  previousSalary: number | null;
  newSalary: number | null;
  salaryChange: number;
  effectiveDate: string;
  reason: string | null;
  status: PromotionStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  initiatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionStats {
  total: number;
  pending: number;
  approved: number;
  implemented: number;
  totalSalaryUplift: number;
}

export interface CreatePromotionPayload {
  employeeId: string;
  newJobTitle: string;
  newJobLevel?: string;
  newSalary?: number;
  effectiveDate: string;
  reason?: string;
}

export interface PromotionQueryParams {
  employeeId?: string;
  status?: PromotionStatus;
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
