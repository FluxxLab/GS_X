import type { RecurringFrequency, RecurringInvoiceStatus } from "@/lib/types/finance";

export const RI_ITEMS_PER_PAGE = 20;

export const FREQUENCY_LABEL: Record<RecurringFrequency, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

export type RIDisplayStatus = "Active" | "Paused" | "Ended";

export function getRIDisplayStatus(status: RecurringInvoiceStatus): RIDisplayStatus {
  const map: Record<RecurringInvoiceStatus, RIDisplayStatus> = {
    ACTIVE: "Active",
    PAUSED: "Paused",
    ENDED: "Ended",
  };
  return map[status] || "Active";
}

export const RI_STATUS_BADGE: Record<RIDisplayStatus, { bg: string; dot: string; color: string }> = {
  Active: { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Paused: { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  Ended: { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
};

export const RI_STATUSES: { value: string; label: string; apiValue?: RecurringInvoiceStatus }[] = [
  { value: "All", label: "All Status" },
  { value: "Active", label: "Active", apiValue: "ACTIVE" },
  { value: "Paused", label: "Paused", apiValue: "PAUSED" },
  { value: "Ended", label: "Ended", apiValue: "ENDED" },
];

export function fmtRICurrency(n: number | string): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatRIDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
