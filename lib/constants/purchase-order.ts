import type { PurchaseOrderStatus } from "@/lib/types/finance";

export type DisplayStatus = "Draft" | "Pending Approval" | "Approved" | "Partially Received" | "Received" | "Cancelled";

export const STATUS_BADGE: Record<DisplayStatus, { bg: string; dot: string; color: string }> = {
  Draft:                { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  "Pending Approval":   { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  Approved:             { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  "Partially Received": { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  Received:             { bg: "#D1FAE5", dot: "#059669", color: "#065F46" },
  Cancelled:            { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
};

export function apiStatusToDisplay(s: PurchaseOrderStatus): DisplayStatus {
  const map: Record<PurchaseOrderStatus, DisplayStatus> = {
    DRAFT: "Draft",
    PENDING_APPROVAL: "Pending Approval",
    APPROVED: "Approved",
    PARTIALLY_RECEIVED: "Partially Received",
    RECEIVED: "Received",
    CANCELLED: "Cancelled",
  };
  return map[s] || "Draft";
}

export const STATUS_TABS: { label: string; value: PurchaseOrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending Approval", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Partially Received", value: "PARTIALLY_RECEIVED" },
  { label: "Received", value: "RECEIVED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function formatPoDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
