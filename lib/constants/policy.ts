import type { PolicyCategory, PolicyStatus, PolicyApprovalDecision } from "@/lib/types/policy";
import type { UserRole } from "@/lib/types/user";

/**
 * Roles that can be put on the hook for signing a policy. Gating a signatory to
 * a role (rather than a named person) is what makes the Designation column mean
 * something — people leave, roles persist.
 */
export const APPROVER_ROLES: UserRole[] = [
  "hr_manager",
  "managing_director",
  "finance_controller",
  "operations_manager",
  "department_head",
  "super_admin",
];

export const APPROVER_ROLE_LABEL: Record<string, string> = {
  hr_manager: "HR Manager",
  managing_director: "Managing Director",
  finance_controller: "Finance Controller",
  operations_manager: "Operations Manager",
  department_head: "Department Head",
  super_admin: "Super Admin",
};

export const POLICY_CATEGORY_LABEL: Record<PolicyCategory, string> = {
  health_safety: "Health & Safety",
  quality: "Quality",
  hr: "Human Resources",
  code_of_conduct: "Code of Conduct",
  confidentiality: "Confidentiality",
  it: "IT",
  finance: "Finance",
  environmental: "Environmental",
  operations: "Operations",
  other: "Other",
};

export const POLICY_CATEGORIES = Object.keys(POLICY_CATEGORY_LABEL) as PolicyCategory[];

export const POLICY_STATUS_LABEL: Record<PolicyStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  published: "Published",
  archived: "Archived",
};

export const POLICY_STATUS_STYLES: Record<PolicyStatus, string> = {
  draft: "bg-[#F4F6FB] text-[#70768E]",
  pending_approval: "bg-[#FEF3C7] text-[#92400E]",
  published: "bg-[#DCFCE7] text-[#166534]",
  archived: "bg-[#DAE0EF] text-[#70768E]",
};

export const APPROVAL_DECISION_STYLES: Record<PolicyApprovalDecision, string> = {
  pending: "bg-[#FEF3C7] text-[#92400E]",
  approved: "bg-[#DCFCE7] text-[#166534]",
  rejected: "bg-[#FEE2E2] text-[#991B1B]",
};

/** Stated review cadences. 24 = the Dress Code Policy's "every two (2) years". */
export const REVIEW_CADENCES: { value: string; label: string }[] = [
  { value: "", label: "No fixed cycle" },
  { value: "12", label: "Every year" },
  { value: "24", label: "Every 2 years" },
  { value: "36", label: "Every 3 years" },
];

// ─── Exceptions (Dress Code Policy §16) ──────────────────────────────────────

export const EXCEPTION_REASON_LABEL: Record<string, string> = {
  medical: "Medical condition",
  disability: "Disability",
  religious: "Religious requirement",
  special_assignment: "Special assignment",
  company_event: "Company event",
  safety: "Safety consideration",
  operational: "Operational need",
  other: "Other",
};

export const EXCEPTION_REASONS = Object.keys(EXCEPTION_REASON_LABEL);

export const EXCEPTION_STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#FEF3C7] text-[#92400E]",
  approved: "bg-[#DCFCE7] text-[#166534]",
  rejected: "bg-[#FEE2E2] text-[#991B1B]",
  expired: "bg-[#F4F6FB] text-[#70768E]",
  revoked: "bg-[#DAE0EF] text-[#70768E]",
};
