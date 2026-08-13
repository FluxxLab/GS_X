import type { PVStatus } from "@/lib/types/finance";

export type DisplayStatus =
  | "Draft"
  | "Pending"
  | "HOD Approved"
  | "MD Approved"
  | "Finance Reviewed"
  | "Processed"
  | "Rejected";

export const STATUS_BADGE: Record<DisplayStatus, { bg: string; dot: string; color: string }> = {
  Draft:              { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  Pending:            { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  "HOD Approved":     { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  "MD Approved":      { bg: "#E0E7FF", dot: "#6366F1", color: "#3730A3" },
  "Finance Reviewed": { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Processed:          { bg: "#D1FAE5", dot: "#059669", color: "#065F46" },
  Rejected:           { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
};

export function mapStatus(s: PVStatus): DisplayStatus {
  const m: Record<PVStatus, DisplayStatus> = { DRAFT: "Draft", PENDING: "Pending", HOD_APPROVED: "HOD Approved", MD_APPROVED: "MD Approved", FINANCE_REVIEWED: "Finance Reviewed", PROCESSED: "Processed", REJECTED: "Rejected" };
  return m[s] || "Draft";
}

export const TABS = ["All", "Draft", "Pending", "Processed", "Rejected"];

export function fmtPvDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
