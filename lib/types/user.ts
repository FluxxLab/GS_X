export type UserRole = 'super_admin' | 'managing_director' | 'finance_controller' | 'hr_manager' | 'warehouse_manager' | 'operations_manager' | 'department_head' | 'employee';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'deactivated';

export type AccessScope = 'all' | 'department' | 'team' | 'self';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  phone: string | null;
  role: UserRole;
  departmentId: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  jobTitle: string | null;
  status: UserStatus;
  mfaEnabled: boolean;
  /** Authenticator-app second factor is active (TOTP). */
  totpEnabled?: boolean;
  lastLogin: string | null;
  approvalLevel: number | null;
  canApprove: boolean;
  accessScope: AccessScope;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Days until the password must be rotated (from /auth/me). null when expiry
  // is disabled; drives the advance-warning banner.
  passwordExpiresInDays?: number | null;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  // Optional: omit to use the backend invite flow (random password + emailed
  // set-password link). Provide only for an admin-set initial password.
  password?: string;
  role: UserRole;
  phone?: string;
  departmentId?: string;
  jobTitle?: string;
  status?: UserStatus;
  mfaEnabled?: boolean;
  approvalLevel?: number;
  canApprove?: boolean;
  accessScope?: AccessScope;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>>;

export interface UserQueryParams {
  search?: string;
  role?: UserRole;
  department?: string;
  status?: UserStatus;
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

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingActivation: number;
}
