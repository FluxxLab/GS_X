import type { BudgetStatus } from "@/lib/types/finance";

export type DisplayStatus = "Active" | "Draft" | "Closed" | "Under Review" | "Finance Approved" | "Rejected";

/** Budget list currency formatter — whole-naira (no decimals), matches the budgets pages. */
export function fmtCurrency(n: number | string): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export const STATUS_BADGE: Record<DisplayStatus, { bg: string; dot: string; color: string }> = {
  Active:             { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Draft:              { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  "Under Review":     { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  "Finance Approved": { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  Rejected:           { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
  Closed:             { bg: "#E0E7FF", dot: "#6366F1", color: "#3730A3" },
};

export const TABS = ["All Budgets", "Under Review", "Awaiting MD", "Active", "Rejected", "Closed"];

export function apiStatusToDisplay(status: BudgetStatus): DisplayStatus {
  const map: Record<BudgetStatus, DisplayStatus> = {
    ACTIVE: "Active",
    DRAFT: "Draft",
    UNDER_REVIEW: "Under Review",
    FINANCE_APPROVED: "Finance Approved",
    REJECTED: "Rejected",
    CLOSED: "Closed",
  };
  return map[status] || "Draft";
}

export function tabToApiStatus(tab: string): BudgetStatus | undefined {
  const map: Record<string, BudgetStatus> = {
    Active: "ACTIVE",
    Draft: "DRAFT",
    "Awaiting MD": "FINANCE_APPROVED",
    Rejected: "REJECTED",
    "Under Review": "UNDER_REVIEW",
    Closed: "CLOSED",
  };
  return map[tab];
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
