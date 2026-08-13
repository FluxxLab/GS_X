export type DepartmentStatus = 'active' | 'inactive';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  headName: string | null;
  headEmployeeId: string | null;
  parentDepartmentId: string | null;
  status: DepartmentStatus;
  employeeCount: number;
  activeEmployees: number;
  openPositions: number;
  budgetAllocation: number | null;
  budgetUtilization: number | null;
  createdAt: string;
  updatedAt: string;
  parentDepartment?: Department;
  children?: Department[];
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  headName?: string;
  headEmployeeId?: string;
  parentDepartmentId?: string;
  status?: DepartmentStatus;
  budgetAllocation?: number;
}

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

export interface DepartmentQueryParams {
  search?: string;
  status?: DepartmentStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentStats {
  totalDepartments: number;
  totalEmployees: number;
  avgTeamSize: number;
  departmentHeads: number;
}
