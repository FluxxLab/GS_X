import type { PVStatus } from "@/lib/types/finance";

export type DisplayStatus = "Draft" | "Pending" | "HOD Approved" | "MD Approved" | "Finance Reviewed" | "Processed" | "Rejected";

export const STATUS_BADGE: Record<DisplayStatus, { bg: string; dot: string; color: string }> = {
  Draft:              { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  Pending:            { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  "HOD Approved":     { bg: "#E0E7FF", dot: "#6366F1", color: "#4338CA" },
  "MD Approved":      { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  "Finance Reviewed": { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Processed:          { bg: "#D1FAE5", dot: "#059669", color: "#065F46" },
  Rejected:           { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
};

export function apiStatusToDisplay(s: PVStatus): DisplayStatus {
  const map: Record<string, DisplayStatus> = {
    DRAFT: "Draft",
    PENDING: "Pending",
    HOD_APPROVED: "HOD Approved",
    MD_APPROVED: "MD Approved",
    FINANCE_REVIEWED: "Finance Reviewed",
    PROCESSED: "Processed",
    REJECTED: "Rejected",
  };
  return map[s] || "Draft";
}

export const STATUS_TABS: { label: string; value: PVStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending", value: "PENDING" },
  { label: "HOD Approved", value: "HOD_APPROVED" as PVStatus },
  { label: "MD Approved", value: "MD_APPROVED" as PVStatus },
  { label: "Finance Reviewed", value: "FINANCE_REVIEWED" as PVStatus },
  { label: "Processed", value: "PROCESSED" },
  { label: "Rejected", value: "REJECTED" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "Select method..." },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "POS", label: "POS" },
  { value: "ONLINE", label: "Online" },
];

/** "₦ 1,500.00" — 2-decimal naira (the PV-page style). */
export function fmtPVCurrency(n: number): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPVDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
