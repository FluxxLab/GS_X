import type { LoanStatus } from "@/lib/types/finance";

export type LoanDisplayStatus = "Active" | "Paid Off" | "Cancelled";

export function getLoanDisplayStatus(status: LoanStatus): LoanDisplayStatus {
  const map: Record<LoanStatus, LoanDisplayStatus> = {
    ACTIVE: "Active",
    PAID_OFF: "Paid Off",
    CANCELLED: "Cancelled",
  };
  return map[status] || "Active";
}

export const LOAN_STATUS_BADGE: Record<LoanDisplayStatus, { bg: string; dot: string; color: string }> = {
  Active: { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  "Paid Off": { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  Cancelled: { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
};

export const LOAN_STATUSES: { value: string; label: string; apiValue?: LoanStatus }[] = [
  { value: "All", label: "All Status" },
  { value: "Active", label: "Active", apiValue: "ACTIVE" },
  { value: "Paid Off", label: "Paid Off", apiValue: "PAID_OFF" },
  { value: "Cancelled", label: "Cancelled", apiValue: "CANCELLED" },
];

export function fmtLoanCurrency(n: number | string): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatLoanDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
