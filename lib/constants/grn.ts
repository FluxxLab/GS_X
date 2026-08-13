import type { GrnStatus } from "@/lib/types/finance";

export type DisplayStatus = "Draft" | "Confirmed" | "Disputed";

export const STATUS_BADGE: Record<DisplayStatus, { bg: string; dot: string; color: string }> = {
  Draft:     { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  Confirmed: { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Disputed:  { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
};

export function apiStatusToDisplay(s: GrnStatus): DisplayStatus {
  const map: Record<GrnStatus, DisplayStatus> = {
    DRAFT: "Draft",
    CONFIRMED: "Confirmed",
    DISPUTED: "Disputed",
  };
  return map[s] || "Draft";
}

export const STATUS_TABS: { label: string; value: GrnStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Disputed", value: "DISPUTED" },
];

export const CONDITION_OPTIONS = [
  { value: "Good", label: "Good" },
  { value: "Damaged", label: "Damaged" },
  { value: "Partial", label: "Partial" },
];

export function formatGrnDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
