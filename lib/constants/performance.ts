import type { Employee } from "@/lib/types/employee";

/** Shared display tokens and helpers for the performance (tasks & KPIs) page. */

export const PERF_FONT = "var(--font-inter), Inter, sans-serif";

const now = new Date();
export const CURRENT_QUARTER = `Q${Math.ceil((now.getMonth() + 1) / 3)}`;
export const CURRENT_YEAR = now.getFullYear();

export const PRIORITY_STYLES: Record<string, { bg: string; color: string }> = {
  low: { bg: "#F4F6FB", color: "#70768E" },
  medium: { bg: "#DBEAFE", color: "#2563EB" },
  high: { bg: "#FEF3C7", color: "#D97706" },
  urgent: { bg: "#FEE2E2", color: "#DC2626" },
};

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  todo: { bg: "#F4F6FB", color: "#70768E" },
  in_progress: { bg: "#DBEAFE", color: "#2563EB" },
  submitted: { bg: "#FEF3C7", color: "#D97706" },
  completed: { bg: "#DCFCE7", color: "#16A34A" },
  rejected: { bg: "#FEE2E2", color: "#DC2626" },
  overdue: { bg: "#FEE2E2", color: "#DC2626" },
  cancelled: { bg: "#F4F6FB", color: "#8B93AD" },
};

export function formatPerfDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getInitials(e: Employee | undefined): string {
  if (!e) return "??";
  return `${e.firstName?.[0] || ""}${e.lastName?.[0] || ""}`.toUpperCase();
}
