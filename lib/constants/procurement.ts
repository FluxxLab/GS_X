import type {
  ContractStatus, ContractType,
  RfqStatus,
  PRStatus,
} from "@/lib/types/finance";

/** Shared procurement domain: display maps, status badges, label maps, option
 * lists, and pure helpers. Mirrors `lib/constants/expense.ts` /
 * `lib/constants/separation.ts`; imported by the contracts, RFQ, and
 * requisitions pages so nothing is duplicated per page. */

export const ITEMS_PER_PAGE = 20;

/** Currency formatter preserved byte-for-byte from the original procurement
 * pages (accepts `number | string`, unlike `lib/utils/format.fmtCurrency`). */
export function fmtCurrency(n: number | string): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Date formatter shared across the three procurement list/detail views. */
export function formatProcDate(d: string): string {
  const dateStr = d.includes("T") ? d : d + "T00:00:00";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Contracts ────────────────────────────────────────────────────────────

export type ContractDisplayStatus =
  | "Draft" | "Under Review" | "Legal Approved" | "Finance Approved" | "MD Approved"
  | "Sent to Vendor" | "Active" | "Expired" | "Terminated" | "Renewed";

export const CONTRACT_STATUS_DISPLAY: Record<ContractStatus, ContractDisplayStatus> = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Under Review",
  LEGAL_APPROVED: "Legal Approved",
  FINANCE_APPROVED: "Finance Approved",
  MD_APPROVED: "MD Approved",
  SENT_TO_VENDOR: "Sent to Vendor",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  TERMINATED: "Terminated",
  RENEWED: "Renewed",
};

export const CONTRACT_STATUS_TO_API: Record<string, ContractStatus> = {
  Draft: "DRAFT",
  "Under Review": "UNDER_REVIEW",
  Active: "ACTIVE",
  Expired: "EXPIRED",
  Terminated: "TERMINATED",
};

export const CONTRACT_STATUS_BADGE: Record<ContractDisplayStatus, { bg: string; dot: string; color: string }> = {
  Draft:              { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  "Under Review":     { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  "Legal Approved":   { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  "Finance Approved": { bg: "#E0E7FF", dot: "#6366F1", color: "#3730A3" },
  "MD Approved":      { bg: "#D5F5F6", dot: "#0EA5E9", color: "#0C4A6E" },
  "Sent to Vendor":   { bg: "#FFF7ED", dot: "#F97316", color: "#9A3412" },
  Active:             { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Expired:            { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
  Terminated:         { bg: "#FECACA", dot: "#DC2626", color: "#7F1D1D" },
  Renewed:            { bg: "#F0FDF4", dot: "#22C55E", color: "#166534" },
};

export const CONTRACT_TYPE_DISPLAY: Record<ContractType, string> = {
  SUPPLY: "Supply",
  WORKS: "Works",
  CONSULTANCY: "Consultancy",
  MSA: "MSA",
  FRAMEWORK: "Framework",
  SLA: "SLA",
};

export const CONTRACT_TYPE_BADGE_COLORS: Record<ContractType, { bg: string; color: string }> = {
  SUPPLY:       { bg: "#DBEAFE", color: "#1E40AF" },
  WORKS:        { bg: "#FEF3C7", color: "#92400E" },
  CONSULTANCY:  { bg: "#E0E7FF", color: "#3730A3" },
  MSA:          { bg: "#D1FAE5", color: "#065F46" },
  FRAMEWORK:    { bg: "#FFF7ED", color: "#9A3412" },
  SLA:          { bg: "#F3E8FF", color: "#6B21A8" },
};

export const CONTRACT_STATUS_TABS = ["All", "Draft", "Under Review", "Active", "Expired", "Terminated"];

// ─── RFQ ──────────────────────────────────────────────────────────────────

export type RfqDisplayStatus = "Draft" | "Sent" | "Quotes Received" | "Evaluated" | "Awarded" | "Cancelled";

export const RFQ_STATUS_DISPLAY: Record<RfqStatus, RfqDisplayStatus> = {
  DRAFT: "Draft",
  SENT: "Sent",
  QUOTES_RECEIVED: "Quotes Received",
  EVALUATED: "Evaluated",
  AWARDED: "Awarded",
  CANCELLED: "Cancelled",
};

export const RFQ_STATUS_TO_API: Record<string, RfqStatus> = {
  Draft: "DRAFT",
  Sent: "SENT",
  "Quotes Received": "QUOTES_RECEIVED",
  Evaluated: "EVALUATED",
  Awarded: "AWARDED",
  Cancelled: "CANCELLED",
};

export const RFQ_STATUS_BADGE: Record<RfqDisplayStatus, { bg: string; dot: string; color: string }> = {
  Draft:             { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  Sent:              { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  "Quotes Received": { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  Evaluated:         { bg: "#E0E7FF", dot: "#6366F1", color: "#3730A3" },
  Awarded:           { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Cancelled:         { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
};

export const RFQ_STATUS_TABS = ["All", "Draft", "Sent", "Quotes Received", "Evaluated", "Awarded"];

// ─── Purchase Requisitions ──────────────────────────────────────────────────

export type PRDisplayStatus =
  | "Draft" | "Pending" | "HOD Approved" | "Finance Approved" | "Approved" | "Rejected" | "Converted";

export const PR_STATUS_DISPLAY: Record<PRStatus, PRDisplayStatus> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  HOD_APPROVED: "HOD Approved",
  FINANCE_APPROVED: "Finance Approved",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CONVERTED: "Converted",
};

export const PR_STATUS_TO_API: Record<string, PRStatus> = {
  Draft: "DRAFT",
  Pending: "PENDING",
  "HOD Approved": "HOD_APPROVED",
  "Finance Approved": "FINANCE_APPROVED",
  Approved: "APPROVED",
  Rejected: "REJECTED",
  Converted: "CONVERTED",
};

export const PR_STATUS_BADGE: Record<PRDisplayStatus, { bg: string; dot: string; color: string }> = {
  Draft:             { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  Pending:           { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  "HOD Approved":    { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  "Finance Approved":{ bg: "#E0E7FF", dot: "#6366F1", color: "#3730A3" },
  Approved:          { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Rejected:          { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
  Converted:         { bg: "#F0FDF4", dot: "#22C55E", color: "#166534" },
};

export const PR_METHOD_DISPLAY: Record<string, string> = {
  DIRECT_PURCHASE: "Direct Purchase",
  REQUEST_FOR_QUOTATION: "RFQ",
  NATIONAL_COMPETITIVE_BIDDING: "NCB",
  INTERNATIONAL_COMPETITIVE_BIDDING: "ICB",
};

export const PR_STATUS_TABS = ["All", "Draft", "Pending", "HOD Approved", "Finance Approved", "Approved", "Rejected"];
