import type { EmploymentStatus, EmploymentType } from "@/lib/types/employee";

/**
 * Display maps + pure formatters for the employee profile page.
 * Neutral constants module — never imports from `app/`.
 */

export const PROFILE_TABS = ["Overview", "Documents", "Attendance", "Benefits", "Notes"] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

export const STATUS_STYLES: Record<EmploymentStatus, { color: string; bg: string }> = {
  active: { color: "#15803D", bg: "#DCFCE7" },
  on_leave: { color: "#B45309", bg: "#FEF3C7" },
  suspended: { color: "#DC2626", bg: "#FEE2E2" },
  terminated: { color: "#70768E", bg: "#F4F6FB" },
  resigned: { color: "#70768E", bg: "#F4F6FB" },
};

export const STATUS_LABELS: Record<EmploymentStatus, string> = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  terminated: "Terminated",
  resigned: "Resigned",
};

export const TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  intern: "Intern",
};

/** Type badge styling for document categories in the Documents tab. */
export const DOC_TYPE_BADGES: Record<string, { bg: string; color: string }> = {
  offer_letter: { bg: "#DBEAFE", color: "#1E40AF" },
  contract: { bg: "#DBEAFE", color: "#1E40AF" },
  id_card: { bg: "#F4F6FB", color: "#081340" },
  certificate: { bg: "#D1FAE5", color: "#065F46" },
  other: { bg: "#F4F6FB", color: "#70768E" },
};

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

export function capitalizeFirst(str: string | null): string {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
