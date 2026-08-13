import { FolderOpen, UsersRound, MonitorSmartphone, GraduationCap, type LucideIcon } from "lucide-react";

/**
 * Display maps + pure helpers for the employee self-service My Onboarding page
 * (`app/dashboard/my-onboarding`). Kept page-local (icon size 18, this page's
 * color palette) — distinct from the HR-facing `lib/constants/onboarding.ts`.
 */

export const MY_ONBOARDING_FONT = "var(--font-inter), Inter, sans-serif";
export const PRIMARY = "#081340";

export const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "#D97706", bg: "rgba(217,119,6,0.08)", label: "Pending" },
  in_progress: { color: "#2563EB", bg: "rgba(37,99,235,0.08)", label: "In Progress" },
  completed: { color: "#059669", bg: "rgba(5,150,105,0.08)", label: "Completed" },
  cancelled: { color: "#70768E", bg: "rgba(112, 118, 142,0.08)", label: "Cancelled" },
};

/** Category meta as pure data — the component renders the icon (size 18, strokeWidth 1.8, given color). */
export interface MyOnboardingCategoryMeta {
  label: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
}

export const CATEGORY_META: Record<string, MyOnboardingCategoryMeta> = {
  documentation: { label: "Documentation", Icon: FolderOpen, color: PRIMARY, bg: "rgba(8, 19, 64,0.08)" },
  hr_administration: { label: "HR & Administration", Icon: UsersRound, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  hr_admin: { label: "HR & Administration", Icon: UsersRound, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  it_setup: { label: "IT Setup", Icon: MonitorSmartphone, color: "#0EA5E9", bg: "rgba(14,165,233,0.08)" },
  training: { label: "Training", Icon: GraduationCap, color: "#059669", bg: "rgba(5,150,105,0.08)" },
};

export function getCategoryMeta(category: string): MyOnboardingCategoryMeta {
  return CATEGORY_META[category] || { label: category, Icon: FolderOpen, color: "#70768E", bg: "rgba(112, 118, 142,0.08)" };
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}
