import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { DashboardData, ReportQueryParams } from "@/lib/types/finance";

/** Naira amount formatter for the finance dashboard (0 dp). */
export function fmtCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "₦ 0";
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "0%";
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}

export function getDateRange(period: string): ReportQueryParams {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (period === "month") {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
  }
  if (period === "quarter") {
    const qStart = Math.floor(month / 3) * 3;
    const start = new Date(year, qStart, 1);
    const end = new Date(year, qStart + 3, 0);
    return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
  }
  // year
  return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
}

export const PERIOD_OPTIONS = [
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** How the current period is compared: the immediately-prior period, or the same period a year ago. */
export type CompareBasis = "prev" | "yoy";

/** The prior comparable period (previous month / quarter / year) for deltas. */
export function getPreviousDateRange(period: string): ReportQueryParams {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (period === "month") {
    return { startDate: iso(new Date(year, month - 1, 1)), endDate: iso(new Date(year, month, 0)) };
  }
  if (period === "quarter") {
    const qStart = Math.floor(month / 3) * 3 - 3;
    return { startDate: iso(new Date(year, qStart, 1)), endDate: iso(new Date(year, qStart + 3, 0)) };
  }
  return { startDate: `${year - 1}-01-01`, endDate: `${year - 1}-12-31` };
}

/** The same period one year ago (year-over-year baseline). */
export function getYoYDateRange(period: string): ReportQueryParams {
  const now = new Date();
  const year = now.getFullYear() - 1;
  const month = now.getMonth();
  if (period === "month") {
    return { startDate: iso(new Date(year, month, 1)), endDate: iso(new Date(year, month + 1, 0)) };
  }
  if (period === "quarter") {
    const qStart = Math.floor(month / 3) * 3;
    return { startDate: iso(new Date(year, qStart, 1)), endDate: iso(new Date(year, qStart + 3, 0)) };
  }
  return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
}

/** The comparison baseline range for the chosen basis. */
export function getComparisonDateRange(period: string, basis: CompareBasis): ReportQueryParams {
  return basis === "yoy" ? getYoYDateRange(period) : getPreviousDateRange(period);
}

/** Trailing 12 whole months up to today — the series that drives KPI sparklines. */
export function getTrailing12Range(): ReportQueryParams {
  const now = new Date();
  return { startDate: iso(new Date(now.getFullYear(), now.getMonth() - 11, 1)), endDate: iso(now) };
}

/** "vs last month/quarter/year" label for the comparison. */
export function comparisonLabel(period: string, basis: CompareBasis = "prev"): string {
  if (basis === "yoy") return "vs last year";
  return period === "quarter" ? "vs last quarter" : period === "year" ? "vs last year" : "vs last month";
}

/** Percent change vs a baseline; null when there's no comparable baseline. */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// ─── Status / Type badges ────────────────────────────────────────────────────

export const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  COMPLETED: { bg: "#DCFCE7", color: "#166534", label: "COMPLETED" },
  PENDING: { bg: "#FEF3C7", color: "#92400E", label: "PENDING" },
  FAILED: { bg: "#FEE2E2", color: "#991B1B", label: "FAILED" },
  REVERSED: { bg: "#F4F6FB", color: "#081340", label: "REVERSED" },
};

export const TYPE_BADGE: Record<string, { bg: string; color: string; label: string; icon: typeof ArrowUpRight }> = {
  INCOMING: { bg: "#DCFCE7", color: "#166534", label: "INCOMING", icon: ArrowDownRight },
  OUTGOING: { bg: "#FEE2E2", color: "#991B1B", label: "OUTGOING", icon: ArrowUpRight },
};

// ─── Invoice Aging Colors ────────────────────────────────────────────────────

export const AGING_COLORS: Record<string, string> = {
  "Current": "#22C55E",
  "1-30 Days": "#3B82F6",
  "31-60 Days": "#EAB308",
  "61-90 Days": "#F97316",
  "90+ Days": "#EF4444",
};

// ─── Alert border colors ────────────────────────────────────────────────────

export const ALERT_STYLES: Record<string, { border: string; bg: string; iconColor: string }> = {
  warning: { border: "#F59E0B", bg: "#FFFBEB", iconColor: "#D97706" },
  info: { border: "#3B82F6", bg: "#EFF6FF", iconColor: "#2563EB" },
  success: { border: "#22C55E", bg: "#F0FDF4", iconColor: "#16A34A" },
};

// ─── Empty defaults ──────────────────────────────────────────────────────────

export const EMPTY_DATA: DashboardData = {
  kpis: {
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    revenueChangePercent: 0,
    expenseChangePercent: 0,
    outstandingReceivables: 0,
    cashPosition: 0,
    overdueInvoiceCount: 0,
    pendingExpenseApprovals: 0,
  },
  revenueVsExpenses: [],
  invoiceAging: [],
  recentTransactions: [],
  budgetUtilization: { totalBudgeted: 0, totalActual: 0, utilizationPercent: 0 },
  alerts: [],
};
