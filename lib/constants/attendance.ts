import type { AttendanceStatus, LeaveStatus, LeaveType } from "@/lib/types/attendance";

/** Shared attendance domain: badge styles, label maps, option lists, pure helpers.
 * Mirrors `lib/constants/expense.ts` / `lib/constants/separation.ts`; imported by
 * the overtime, leave-management, leave-requests and timesheet pages. */

export const ITEMS_PER_PAGE = 10;

// ─── Request status badges (overtime + leave share these colours) ─────────────
// Overtime adds a `label`; leave derives the label via `statusLabel()`.

export const REQUEST_STATUS_STYLES: Record<string, { bg: string; dot: string; color: string; label: string }> = {
  pending: { bg: "#FEF3C7", dot: "#D97706", color: "#B45309", label: "Pending" },
  approved: { bg: "#D1FAE5", dot: "#059669", color: "#047857", label: "Approved" },
  rejected: { bg: "#FFE4E6", dot: "#E11D48", color: "#BE123C", label: "Rejected" },
  cancelled: { bg: "#F4F6FB", dot: "#70768E", color: "#70768E", label: "Cancelled" },
};

/** Leave-request statuses share the same palette as generic requests. */
export const LEAVE_STATUS_STYLES = REQUEST_STATUS_STYLES;

// ─── Attendance (timesheet) status badges ─────────────────────────────────────

export const ATTENDANCE_STATUS_STYLES: Record<string, { bg: string; dot: string; color: string }> = {
  present: { bg: "#D1FAE5", dot: "#059669", color: "#047857" },
  absent: { bg: "#FFE4E6", dot: "#E11D48", color: "#BE123C" },
  late: { bg: "#FEF3C7", dot: "#D97706", color: "#B45309" },
  on_leave: { bg: "#DBEAFE", dot: "#2563EB", color: "#1D4ED8" },
  half_day: { bg: "#F3E8FF", dot: "#7C3AED", color: "#6D28D9" },
  holiday: { bg: "#E0E7FF", dot: "#4F46E5", color: "#4338CA" },
  weekend: { bg: "#F4F6FB", dot: "#70768E", color: "#70768E" },
};

// ─── Leave type labels ────────────────────────────────────────────────────────

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  casual: "Casual Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  compassionate: "Compassionate Leave",
  study: "Study Leave",
  unpaid: "Unpaid Leave",
};

/** Leave-balance progress-bar palette (leave-requests balance cards). */
export const BALANCE_COLORS = ["#081340", "#F59E0B", "#F43F5E", "#6366F1", "#10B981", "#8B5CF6", "#EC4899", "#70768E"];

// ─── Option lists ─────────────────────────────────────────────────────────────

/** Leave-type options for the create-leave form (maternity/paternity gated by caller). */
export const LEAVE_TYPE_OPTIONS: { value: LeaveType; label: string }[] = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
  { value: "compassionate", label: "Compassionate Leave" },
  { value: "study", label: "Study Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Date-only formatter: parses date-only strings at local midnight. */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Timesheet date formatter: weekday + month + day. */
export function formatTimesheetDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Clock-in/out time formatter; em-dash for null. */
export function formatTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/** Capitalize a leave status for display. */
export function statusLabel(s: LeaveStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Humanize an attendance status (`on_leave` -> `On Leave`). */
export function attendanceStatusLabel(s: AttendanceStatus): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Two-letter initials from a first/last name pair. */
export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "??";
}

/** Monday–Sunday range containing the given date. */
export function getWeekRange(date: Date): { from: string; to: string; label: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const from = monday.toISOString().split("T")[0];
  const to = sunday.toISOString().split("T")[0];
  const label = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  return { from, to, label };
}

/** First–last day range for the month containing the given date. */
export function getMonthRange(date: Date): { from: string; to: string; label: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return { from, to, label };
}
