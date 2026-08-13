import type { UserRole } from "./user";

export type PolicyCategory =
  | "health_safety"
  | "quality"
  | "hr"
  | "code_of_conduct"
  | "confidentiality"
  | "it"
  | "finance"
  | "environmental"
  | "operations"
  | "other";

export type PolicyStatus = "draft" | "pending_approval" | "published" | "archived";

export type PolicyApprovalDecision = "pending" | "approved" | "rejected";

export interface Policy {
  id: string;
  title: string;
  category: PolicyCategory;
  currentVersion: string;
  purpose: string | null;
  declarationText: string | null;
  status: PolicyStatus;
  effectiveDate: string | null;
  nextReviewDate: string | null;
  reviewIntervalMonths: number | null;
  fileKey: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  requiresAcknowledgement: boolean;
  acknowledgementDeadlineDays: number;
  appliesToRoles: string[];
  appliesToDepartmentIds: string[];
  owner: string | null;
  createdBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A row of the document's DOCUMENT HISTORY table. */
export interface PolicyVersion {
  id: string;
  policyId: string;
  version: string;
  date: string;
  purpose: string | null;
  reviewers: string | null;
  declarationText: string | null;
  fileKey: string | null;
  fileName: string | null;
  createdAt: string;
}

/** A row of the document's APPROVAL table. */
export interface PolicyApproval {
  id: string;
  policyId: string;
  version: string;
  sequence: number;
  designation: string;
  approverName: string | null;
  approverId: string | null;
  approverRole: UserRole | null;
  decision: PolicyApprovalDecision;
  signedAt: string | null;
  signedBy: string | null;
  signedByName: string | null;
  note: string | null;
}

export interface PolicyDetail extends Policy {
  versions: PolicyVersion[];
  approvals: PolicyApproval[];
  references: PolicyReference[];
  acknowledgedCount: number;
  applicableCount: number;
}

export interface MyPolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  currentVersion: string;
  purpose: string | null;
  declarationText: string | null;
  effectiveDate: string | null;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  dueDate: string | null;
}

export interface PolicyCompliance {
  policyId: string;
  title: string;
  version: string;
  dueDate: string | null;
  acknowledged: {
    employeeId: string;
    employeeName: string;
    employeeStaffId: string | null;
    departmentName: string | null;
    jobTitle: string | null;
    acknowledgedAt: string;
  }[];
  outstanding: {
    employeeId: string;
    employeeName: string;
    dueDate: string | null;
    overdue: boolean;
  }[];
  percent: number;
}

export interface ApprovalStepPayload {
  sequence: number;
  designation: string;
  approverName?: string;
  approverId?: string;
  /** Restrict signing to holders of this role. */
  approverRole?: UserRole;
}

export interface CreatePolicyPayload {
  title: string;
  category: PolicyCategory;
  version?: string;
  purpose?: string;
  declarationText?: string;
  reviewers?: string;
  effectiveDate?: string;
  nextReviewDate?: string;
  reviewIntervalMonths?: number;
  requiresAcknowledgement?: boolean;
  acknowledgementDeadlineDays?: number;
  appliesToRoles?: string[];
  appliesToDepartmentIds?: string[];
  owner?: string;
  approvals?: ApprovalStepPayload[];
}

export type UpdatePolicyPayload = Partial<
  Omit<CreatePolicyPayload, "version" | "reviewers" | "approvals">
>;

export interface NewPolicyVersionPayload {
  version: string;
  purpose?: string;
  /** Omit to carry the current wording forward. */
  declarationText?: string;
  reviewers?: string;
  effectiveDate?: string;
  approvals?: ApprovalStepPayload[];
}

/** A citation from one policy to another. */
export interface PolicyReference {
  id: string;
  targetPolicyId: string | null;
  targetTitle: string;
  citedAt: string | null;
  /** False = cited but not in the library — the gap worth seeing. */
  resolved: boolean;
  targetStatus: PolicyStatus | null;
}

export interface AddPolicyReferencePayload {
  targetPolicyId?: string;
  targetTitle: string;
  citedAt?: string;
}

export interface DanglingReference {
  policyId: string;
  policyTitle: string;
  targetTitle: string;
  citedAt: string | null;
}
