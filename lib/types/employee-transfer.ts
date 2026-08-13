export type TransferStatus =
  | "pending"
  | "approved"
  | "applied"
  | "rejected"
  | "cancelled";

export interface EmployeeTransfer {
  id: string;
  employeeId: string;
  employeeName: string;
  fromDepartmentId: string | null;
  fromDepartmentName: string | null;
  fromManagerId: string | null;
  fromJobTitle: string | null;
  fromLocation: string | null;
  toDepartmentId: string | null;
  toDepartmentName: string | null;
  toManagerId: string | null;
  toJobTitle: string | null;
  toLocation: string | null;
  effectiveDate: string;
  reason: string | null;
  status: TransferStatus;
  requestedBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeTransferPayload {
  employeeId: string;
  toDepartmentId?: string;
  toManagerId?: string;
  toJobTitle?: string;
  toLocation?: string;
  effectiveDate: string;
  reason?: string;
}

export interface EmployeeTransferQueryParams {
  status?: TransferStatus;
  employeeId?: string;
}
