import type { PettyCashType } from "@/lib/types/finance";

export const ITEMS_PER_PAGE = 20;

export function formatDate(d: string): string {
  const dateStr = d.includes("T") ? d : d + "T00:00:00";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const TYPE_BADGE: Record<PettyCashType, { bg: string; color: string; dot: string }> = {
  EXPENSE:       { bg: "#FEF2F2", color: "#991B1B", dot: "#EF4444" },
  REPLENISHMENT: { bg: "#ECFDF5", color: "#065F46", dot: "#10B981" },
};

export const TYPE_TABS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending Approval", value: "PENDING" },
  { label: "Expenses", value: "EXPENSE" },
  { label: "Replenishments", value: "REPLENISHMENT" },
];
