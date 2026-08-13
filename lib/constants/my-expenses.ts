export type DisplayStatus = "Approved" | "HOD Approved" | "Pending" | "Rejected" | "Draft";

export const STATUS_BADGE: Record<DisplayStatus, { bg: string; dot: string; color: string }> = {
  Approved:       { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  "HOD Approved": { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  Pending:        { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  Rejected:       { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
  Draft:          { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
};

export function mapStatus(s: string): DisplayStatus {
  if (s === "APPROVED") return "Approved";
  if (s === "HOD_APPROVED") return "HOD Approved";
  if (s === "REJECTED") return "Rejected";
  if (s === "DRAFT") return "Draft";
  return "Pending";
}

export const TABS = ["All", "My Expenses", "Dept. Approvals", "Approved", "Rejected"];

export function fmtExpenseDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
