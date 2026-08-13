import type {
  SeparationStatus,
  HandoverCategory,
} from "@/lib/types/separation";

/**
 * Display maps + pure helpers for the employee self-service My Exit page
 * (`app/dashboard/my-exit`). Page-local palette/labels (distinct from the
 * HR-facing `lib/constants/separation.ts`), lifted out of the component.
 */

export const MY_EXIT_FONT = "var(--font-inter), Inter, sans-serif";
export const PRIMARY = "#081340";

export const STAGES: { key: SeparationStatus; label: string }[] = [
  { key: "INITIATED", label: "Initiated" },
  { key: "NOTICE_PERIOD", label: "Notice Period" },
  { key: "CLEARANCE", label: "Clearance" },
  { key: "SETTLEMENT", label: "Settlement" },
  { key: "COMPLETED", label: "Completed" },
];

export const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  INITIATED: { color: "#D97706", bg: "rgba(217,119,6,0.08)", label: "Initiated" },
  NOTICE_PERIOD: { color: "#2563EB", bg: "rgba(37,99,235,0.08)", label: "Notice Period" },
  CLEARANCE: { color: "#7C3AED", bg: "rgba(124,58,237,0.08)", label: "Clearance" },
  SETTLEMENT: { color: "#0EA5E9", bg: "rgba(14,165,233,0.08)", label: "Settlement" },
  COMPLETED: { color: "#059669", bg: "rgba(5,150,105,0.08)", label: "Completed" },
  CANCELLED: { color: "#70768E", bg: "rgba(112, 118, 142,0.08)", label: "Cancelled" },
};

export const TYPE_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  RESIGNATION: { color: "#D97706", bg: "rgba(217,119,6,0.08)", label: "Resignation" },
  TERMINATION: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "Termination" },
  REDUNDANCY: { color: "#70768E", bg: "rgba(112, 118, 142,0.08)", label: "Redundancy" },
  RETIREMENT: { color: "#059669", bg: "rgba(5,150,105,0.08)", label: "Retirement" },
  END_OF_CONTRACT: { color: "#7C3AED", bg: "rgba(124,58,237,0.08)", label: "End of Contract" },
  DEATH_IN_SERVICE: { color: "#1E293B", bg: "rgba(30,41,59,0.08)", label: "Death in Service" },
};

export const NOTICE_TYPE_LABELS: Record<string, string> = {
  SERVE: "Serve Notice",
  PAY_IN_LIEU: "Pay in Lieu",
  WAIVED: "Waived",
};

export const HANDOVER_CATEGORY_OPTIONS: { value: HandoverCategory; label: string }[] = [
  { value: "ONGOING_PROJECT", label: "Ongoing Project" },
  { value: "KEY_CONTACT", label: "Key Contact" },
  { value: "SYSTEM_ACCESS", label: "System Access" },
  { value: "PENDING_ITEM", label: "Pending Item" },
  { value: "DOCUMENT_LOCATION", label: "Document Location" },
  { value: "GENERAL_NOTE", label: "General Note" },
];

export const HANDOVER_CATEGORY_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  ONGOING_PROJECT: { color: "#2563EB", bg: "rgba(37,99,235,0.08)", label: "Ongoing Project" },
  KEY_CONTACT: { color: "#7C3AED", bg: "rgba(124,58,237,0.08)", label: "Key Contact" },
  SYSTEM_ACCESS: { color: "#0EA5E9", bg: "rgba(14,165,233,0.08)", label: "System Access" },
  PENDING_ITEM: { color: "#D97706", bg: "rgba(217,119,6,0.08)", label: "Pending Item" },
  DOCUMENT_LOCATION: { color: "#059669", bg: "rgba(5,150,105,0.08)", label: "Document Location" },
  GENERAL_NOTE: { color: "#70768E", bg: "rgba(112, 118, 142,0.08)", label: "General Note" },
};

export const PRIORITY_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  HIGH: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "High" },
  MEDIUM: { color: "#D97706", bg: "rgba(217,119,6,0.08)", label: "Medium" },
  LOW: { color: "#059669", bg: "rgba(5,150,105,0.08)", label: "Low" },
};

export const HANDOVER_STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "#D97706", bg: "rgba(217,119,6,0.08)", label: "Pending" },
  IN_PROGRESS: { color: "#2563EB", bg: "rgba(37,99,235,0.08)", label: "In Progress" },
  TRANSFERRED: { color: "#7C3AED", bg: "rgba(124,58,237,0.08)", label: "Transferred" },
  COMPLETED: { color: "#059669", bg: "rgba(5,150,105,0.08)", label: "Completed" },
};

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}
