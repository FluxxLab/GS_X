export type PolicyExceptionReason =
  | "medical"
  | "disability"
  | "religious"
  | "special_assignment"
  | "company_event"
  | "safety"
  | "operational"
  | "other";

export type PolicyExceptionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "revoked";

export interface PolicyException {
  id: string;
  policyId: string;
  policyTitle: string;
  employeeId: string;
  employeeName: string;
  employeeStaffId: string | null;
  departmentName: string | null;
  reason: PolicyExceptionReason;
  details: string;
  status: PolicyExceptionStatus;
  validFrom: string | null;
  validUntil: string | null;
  fileKey: string | null;
  fileName: string | null;
  requestedBy: string | null;
  decidedBy: string | null;
  decidedByName: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestPolicyExceptionPayload {
  policyId: string;
  reason: PolicyExceptionReason;
  details: string;
  validFrom?: string;
  validUntil?: string;
}

export interface DecidePolicyExceptionPayload {
  decisionNote: string;
  validFrom?: string;
  validUntil?: string;
}
