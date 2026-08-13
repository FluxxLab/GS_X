import {
  FolderOpen,
  UsersRound,
  MonitorSmartphone,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { Onboarding, OnboardingItem } from "@/lib/types/onboarding";

export const PRIMARY = "#081340";

/** The employee shape embedded in an Onboarding (non-null). */
export type OnboardingEmployee = NonNullable<Onboarding["employee"]>;

export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #081340 0%, #2D5F8A 100%)",
  "linear-gradient(135deg, #7C3AED 0%, #9F67FF 100%)",
  "linear-gradient(135deg, #059669 0%, #10B981 100%)",
  "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
  "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
  "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
];

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

/** Category display metadata. Stores the icon component (rendered with size 20, strokeWidth 1.8). */
export interface CategoryMeta {
  label: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  documentation: { label: "Documentation", Icon: FolderOpen, color: PRIMARY, bg: "rgba(8, 19, 64,0.08)" },
  hr_administration: { label: "HR & Administration", Icon: UsersRound, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  hr_admin: { label: "HR & Administration", Icon: UsersRound, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  it_setup: { label: "IT Setup", Icon: MonitorSmartphone, color: "#0EA5E9", bg: "rgba(14,165,233,0.08)" },
  training: { label: "Training", Icon: GraduationCap, color: "#059669", bg: "rgba(5,150,105,0.08)" },
};

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] || { label: category, Icon: FolderOpen, color: "#70768E", bg: "rgba(112, 118, 142,0.08)" };
}

/** Order categories are displayed/sorted in. */
export const CATEGORY_ORDER = ["documentation", "hr_admin", "it_setup", "training"];

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type ItemActionType =
  | "file_upload"
  | "assign_asset"
  | "hmo_enrollment"
  | "guarantor_review"
  | "bank_details"
  | "pension_details"
  | "tax_details"
  | "generate_email"
  | "create_erp_account"
  | "assign_supervisor"
  | "info_display"
  | "manual_check";

/** Determine what action type an onboarding item needs, based on its title. */
export function getItemActionType(item: OnboardingItem): ItemActionType {
  const t = item.title.toLowerCase();
  // Documentation category file uploads
  if (t.includes("collect national id")) return "file_upload";
  if (t.includes("passport photograph")) return "file_upload";
  if (t.includes("educational certificates")) return "file_upload";
  if (t.includes("guarantor")) return "guarantor_review";
  if (t.includes("hmo") || t.includes("nhis")) return "hmo_enrollment";
  // HR data collection
  if (t.includes("bank details")) return "bank_details";
  if (t.includes("pension details") || (t.includes("pension") && t.includes("pfa"))) return "pension_details";
  if (t.includes("tax identification")) return "tax_details";
  // IT actions
  if (t.includes("set up workstation")) return "assign_asset";
  if (t.includes("generate work email")) return "generate_email";
  if (t.includes("create erp user account")) return "create_erp_account";
  // Supervisor assignment
  if (t.includes("assign reporting supervisor")) return "assign_supervisor";
  // Info display (already done from offer flow)
  if (t.includes("assign employee id")) return "info_display";
  if (t.includes("set up salary") || t.includes("payroll")) return "info_display";
  // Everything else is manual
  return "manual_check";
}
