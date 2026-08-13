import type {
  SeparationStatus, SeparationType, NoticeType,
  HandoverCategory, HandoverPriority, HandoverStatus, SettlementStatus,
} from "@/lib/types/separation";

/** Shared separations domain: display maps, badges, label maps, pure helpers.
 * Mirrors `lib/constants/expense.ts`; imported by all three separations pages. */

export const ITEMS_PER_PAGE = 20;

// ─── List display status / type ──────────────────────────────────────────────

export type DisplayStatus = "Initiated" | "Notice Period" | "Clearance" | "Settlement" | "Completed" | "Cancelled";

export function getDisplayStatus(status: SeparationStatus): DisplayStatus {
  const map: Record<SeparationStatus, DisplayStatus> = {
    INITIATED: "Initiated",
    NOTICE_PERIOD: "Notice Period",
    CLEARANCE: "Clearance",
    SETTLEMENT: "Settlement",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return map[status] || (status as DisplayStatus);
}

export type DisplayType = "Resignation" | "Termination" | "Redundancy" | "Retirement" | "End of Contract" | "Death in Service";

export function getDisplayType(type: SeparationType): DisplayType {
  const map: Record<SeparationType, DisplayType> = {
    RESIGNATION: "Resignation",
    TERMINATION: "Termination",
    REDUNDANCY: "Redundancy",
    RETIREMENT: "Retirement",
    END_OF_CONTRACT: "End of Contract",
    DEATH_IN_SERVICE: "Death in Service",
  };
  return map[type] || (type as DisplayType);
}

// ─── Badge styles (display-label keyed — used by the list page) ───────────────

export const STATUS_BADGE: Record<string, { bg: string; dot: string; color: string }> = {
  Initiated:      { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  "Notice Period": { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  Clearance:      { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  Settlement:     { bg: "#E0E7FF", dot: "#6366F1", color: "#4338CA" },
  Completed:      { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Cancelled:      { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
};

export const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  Resignation:      { bg: "#DBEAFE", color: "#1E40AF" },
  Termination:      { bg: "#FEE2E2", color: "#991B1B" },
  Redundancy:       { bg: "#FEF3C7", color: "#92400E" },
  Retirement:       { bg: "#EDE9FE", color: "#6D28D9" },
  "End of Contract": { bg: "#F4F6FB", color: "#70768E" },
  "Death in Service": { bg: "#1E293B", color: "#FFFFFF" },
};

export const STATUSES: { value: string; label: string; apiValue?: SeparationStatus }[] = [
  { value: "All", label: "All" },
  { value: "Initiated", label: "Initiated", apiValue: "INITIATED" },
  { value: "Notice Period", label: "Notice Period", apiValue: "NOTICE_PERIOD" },
  { value: "Clearance", label: "Clearance", apiValue: "CLEARANCE" },
  { value: "Settlement", label: "Settlement", apiValue: "SETTLEMENT" },
  { value: "Completed", label: "Completed", apiValue: "COMPLETED" },
];

// ─── Detail page label/badge maps (API-status keyed) ──────────────────────────

export const STATUS_LABELS: Record<SeparationStatus, string> = {
  INITIATED: "Initiated",
  NOTICE_PERIOD: "Notice Period",
  CLEARANCE: "Clearance",
  SETTLEMENT: "Settlement",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_BADGE_API: Record<string, { bg: string; dot: string; color: string }> = {
  INITIATED:      { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  NOTICE_PERIOD:  { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  CLEARANCE:      { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  SETTLEMENT:     { bg: "#E0E7FF", dot: "#6366F1", color: "#4338CA" },
  COMPLETED:      { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  CANCELLED:      { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
};

export const TYPE_LABELS: Record<SeparationType, string> = {
  RESIGNATION: "Resignation",
  TERMINATION: "Termination",
  REDUNDANCY: "Redundancy",
  RETIREMENT: "Retirement",
  END_OF_CONTRACT: "End of Contract",
  DEATH_IN_SERVICE: "Death in Service",
};

export const TYPE_BADGE_API: Record<SeparationType, { bg: string; color: string }> = {
  RESIGNATION:      { bg: "#DBEAFE", color: "#1E40AF" },
  TERMINATION:      { bg: "#FEE2E2", color: "#991B1B" },
  REDUNDANCY:       { bg: "#FEF3C7", color: "#92400E" },
  RETIREMENT:       { bg: "#EDE9FE", color: "#6D28D9" },
  END_OF_CONTRACT:  { bg: "#F4F6FB", color: "#70768E" },
  DEATH_IN_SERVICE: { bg: "#1E293B", color: "#FFFFFF" },
};

export const NOTICE_LABELS: Record<NoticeType, string> = {
  SERVE: "Serve Notice",
  PAY_IN_LIEU: "Pay in Lieu",
  WAIVED: "Waived",
};

export const STAGES: SeparationStatus[] = ["INITIATED", "NOTICE_PERIOD", "CLEARANCE", "SETTLEMENT", "COMPLETED"];

// ─── Handover note maps (detail page) ─────────────────────────────────────────

import { FolderOpen, UsersRound, Monitor, FileText, MapPin, MessageSquare, type LucideIcon } from "lucide-react";

/** Category meta as pure data — the component renders the icon (size 16, given color). */
export const HANDOVER_CATEGORY_META: Record<HandoverCategory, { label: string; Icon: LucideIcon; color: string }> = {
  ONGOING_PROJECT:   { label: "Ongoing Project",   Icon: FolderOpen,     color: "#0EA5E9" },
  KEY_CONTACT:       { label: "Key Contact",       Icon: UsersRound,     color: "#7C3AED" },
  SYSTEM_ACCESS:     { label: "System Access",     Icon: Monitor,        color: "#059669" },
  PENDING_ITEM:      { label: "Pending Item",      Icon: FileText,       color: "#F59E0B" },
  DOCUMENT_LOCATION: { label: "Document Location", Icon: MapPin,         color: "#EF4444" },
  GENERAL_NOTE:      { label: "General Note",      Icon: MessageSquare,  color: "#70768E" },
};

/** Fallback icon for an unknown handover category. */
export const HANDOVER_FALLBACK_ICON: LucideIcon = MessageSquare;

export const PRIORITY_BADGE: Record<HandoverPriority, { bg: string; color: string }> = {
  HIGH:   { bg: "#FEE2E2", color: "#991B1B" },
  MEDIUM: { bg: "#FEF3C7", color: "#92400E" },
  LOW:    { bg: "#D1FAE5", color: "#065F46" },
};

export const HANDOVER_STATUS_BADGE: Record<HandoverStatus, { bg: string; color: string }> = {
  PENDING:      { bg: "#F4F6FB", color: "#70768E" },
  IN_PROGRESS:  { bg: "#DBEAFE", color: "#1E40AF" },
  TRANSFERRED:  { bg: "#FEF3C7", color: "#92400E" },
  COMPLETED:    { bg: "#D1FAE5", color: "#065F46" },
};

export const HANDOVER_CATEGORIES: { value: HandoverCategory; label: string }[] = [
  { value: "ONGOING_PROJECT", label: "Ongoing Project" },
  { value: "KEY_CONTACT", label: "Key Contact" },
  { value: "SYSTEM_ACCESS", label: "System Access" },
  { value: "PENDING_ITEM", label: "Pending Item" },
  { value: "DOCUMENT_LOCATION", label: "Document Location" },
  { value: "GENERAL_NOTE", label: "General Note" },
];

export const HANDOVER_PRIORITIES: { value: HandoverPriority; label: string }[] = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export const SETTLEMENT_STATUS_BADGE: Record<SettlementStatus, { bg: string; dot: string; color: string }> = {
  DRAFT:            { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  PENDING_APPROVAL: { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  APPROVED:         { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  PAID:             { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
};

/** Department display order for the clearance checklist. */
export const CLEARANCE_DEPT_ORDER = ["IT", "Finance", "Operations", "HR", "Admin"];

// ─── Create-form option lists (shared by the create + bulk forms) ─────────────

export const DEPARTMENTS = ["Operations", "Engineering", "Human Resources", "Finance", "IT", "Marketing", "Procurement", "Quality Assurance"];

export const SEPARATION_TYPES: { value: SeparationType; label: string }[] = [
  { value: "RESIGNATION", label: "Resignation" },
  { value: "TERMINATION", label: "Termination" },
  { value: "REDUNDANCY", label: "Redundancy" },
  { value: "RETIREMENT", label: "Retirement" },
  { value: "END_OF_CONTRACT", label: "End of Contract" },
  { value: "DEATH_IN_SERVICE", label: "Death in Service" },
];

export const NOTICE_TYPES: { value: NoticeType; label: string }[] = [
  { value: "SERVE", label: "Serve Notice" },
  { value: "PAY_IN_LIEU", label: "Pay in Lieu" },
  { value: "WAIVED", label: "Waived" },
];

export const BULK_TYPES: { value: SeparationType; label: string }[] = [
  { value: "REDUNDANCY", label: "Redundancy" },
  { value: "TERMINATION", label: "Termination" },
  { value: "RESIGNATION", label: "Resignation" },
  { value: "END_OF_CONTRACT", label: "End of Contract" },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/** List-page date formatter: parses date-only strings at local midnight. */
export function formatListDate(d: string): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Detail-page date formatter: accepts nullable ISO datetimes. */
export function formatDetailDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
