import { Clock, Eye, CheckCircle2, XCircle } from "lucide-react";
import type { PrequalificationStatus } from "@/lib/types/finance";

export const STATUS_CONFIG: Record<PrequalificationStatus, { bg: string; dot: string; color: string; label: string; icon: typeof Clock }> = {
  SUBMITTED:    { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF", label: "Submitted", icon: Clock },
  UNDER_REVIEW: { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E", label: "Under Review", icon: Eye },
  APPROVED:     { bg: "#D1FAE5", dot: "#10B981", color: "#065F46", label: "Approved", icon: CheckCircle2 },
  REJECTED:     { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B", label: "Rejected", icon: XCircle },
};

export const STATUS_TABS: { label: string; value: PrequalificationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export const PREQUAL_STEPS = ["Company Info", "Registration & Compliance", "Banking & Financials"];

export function formatPrequalDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
