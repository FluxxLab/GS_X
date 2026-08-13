import { apiClient } from "../api/client";

export type ApprovalKind =
  | "transfer"
  | "timesheet"
  | "loan"
  | "appraisal"
  | "disciplinary"
  | "grievance";

export interface ApprovalItem {
  kind: ApprovalKind;
  id: string;
  title: string;
  subtitle: string;
  date: string;
  link: string;
}

export interface HrApprovals {
  counts: Record<ApprovalKind | "total", number>;
  items: ApprovalItem[];
}

export const hrApprovalsService = {
  getPending(): Promise<HrApprovals> {
    return apiClient.get<HrApprovals>("/hr-approvals");
  },
};
