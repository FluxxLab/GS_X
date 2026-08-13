import type { InvoiceStatus } from "@/lib/types/finance";

export type DisplayStatus = "Paid" | "Pending" | "Overdue" | "Draft" | "Partial" | "Sent" | "Cancelled" | "Void";

export const ITEMS_PER_PAGE = 20;

export function getDisplayStatus(status: InvoiceStatus): DisplayStatus {
  const map: Record<InvoiceStatus, DisplayStatus> = {
    PAID: "Paid",
    PENDING: "Pending",
    OVERDUE: "Overdue",
    DRAFT: "Draft",
    PARTIAL: "Partial",
    SENT: "Sent",
    CANCELLED: "Cancelled",
    VOID: "Void",
  };
  return map[status] || (status as DisplayStatus);
}

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export const STATUS_BADGE: Record<string, { bg: string; dot: string; color: string }> = {
  Paid:      { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Pending:   { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  Overdue:   { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
  Draft:     { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  Partial:   { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  Sent:      { bg: "#E0E7FF", dot: "#6366F1", color: "#3730A3" },
  Cancelled: { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
  Void:      { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
};

export const STATUSES: { value: string; label: string; apiValue?: InvoiceStatus }[] = [
  { value: "All", label: "All Status" },
  { value: "Paid", label: "Paid", apiValue: "PAID" },
  { value: "Pending", label: "Pending", apiValue: "PENDING" },
  { value: "Overdue", label: "Overdue", apiValue: "OVERDUE" },
  { value: "Draft", label: "Draft", apiValue: "DRAFT" },
  { value: "Partial", label: "Partial", apiValue: "PARTIAL" },
  { value: "Sent", label: "Sent", apiValue: "SENT" },
];

/** 0-dp Naira formatter used on the invoices page (differs from the 2-dp shared one). */
export function fmtInvoiceCurrency(n: number | string): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatInvoiceDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
