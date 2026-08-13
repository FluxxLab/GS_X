import type { AmortizationType, AmortizationStatus } from "@/lib/types/finance";

export const AMORT_ITEMS_PER_PAGE = 20;

export const AMORT_TYPE_LABEL: Record<AmortizationType, string> = {
  PREPAID_EXPENSE: "Prepaid Expense",
  DEFERRED_REVENUE: "Deferred Revenue",
};

export const AMORT_TYPES: { value: AmortizationType; label: string }[] = [
  { value: "PREPAID_EXPENSE", label: "Prepaid Expense" },
  { value: "DEFERRED_REVENUE", label: "Deferred Revenue" },
];

export type AmortDisplayStatus = "Active" | "Completed" | "Cancelled";

export function getAmortDisplayStatus(status: AmortizationStatus): AmortDisplayStatus {
  const map: Record<AmortizationStatus, AmortDisplayStatus> = {
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return map[status] || "Active";
}

export const AMORT_STATUS_BADGE: Record<AmortDisplayStatus, { bg: string; dot: string; color: string }> = {
  Active: { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Completed: { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  Cancelled: { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
};

export const AMORT_STATUSES: { value: string; label: string; apiValue?: AmortizationStatus }[] = [
  { value: "All", label: "All Status" },
  { value: "Active", label: "Active", apiValue: "ACTIVE" },
  { value: "Completed", label: "Completed", apiValue: "COMPLETED" },
  { value: "Cancelled", label: "Cancelled", apiValue: "CANCELLED" },
];

export function fmtAmortCurrency(n: number | string): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatAmortDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
