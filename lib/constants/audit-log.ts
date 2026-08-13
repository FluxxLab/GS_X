import type { ReactNode } from "react";
import type { AuditAction } from "@/lib/types/finance";

/**
 * Display constants and mapping helpers for the read-only Audit Logs page.
 *
 * The page is backed by the real `audit-logs` API (see `useAuditLogs`). The
 * backend record shape is `AuditLog` (lib/types/finance.ts): id, entityType,
 * entityId, action, performedBy, performedAt, changes, ipAddress, description.
 * The maps below translate those fields into the existing table presentation.
 */

export type EventStatus = "Success" | "Failed" | "Blocked" | "Warning" | "Info";

/** A real `AuditLog` projected into the columns the table renders. */
export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  initials: string;
  action: string;
  description: string;
  module: string;
  ipAddress: string;
  status: EventStatus;
  /** The raw backend action — used for the (backend-filtered) event-type select. */
  eventType: AuditAction;
}

export interface AuditKpiCard {
  label: string;
  value: string;
  badge: string | null;
  badgeColor: string;
  badgeBg: string;
  icon: ReactNode;
  valueColor?: string;
  /** Card-as-filter key. `"ALL"` resets; omit for a non-filterable card. */
  filter?: AuditCardFilter;
}

/** KPI cards double as table filters; `"ALL"` shows everything. */
export type AuditCardFilter = "ALL" | "CREATE" | "DATA_CHANGES" | "SECURITY";

/**
 * Predicate per card filter — the single source of truth shared by the KPI
 * counts and the table's row filter, so each filter matches its count exactly.
 */
export const auditCardPredicates: Record<
  Exclude<AuditCardFilter, "ALL">,
  (e: AuditEntry) => boolean
> = {
  CREATE: (e) => e.eventType === "CREATE",
  DATA_CHANGES: (e) => ["CREATE", "UPDATE", "DELETE"].includes(e.eventType),
  SECURITY: (e) => e.status === "Failed" || e.status === "Blocked",
};

export const statusStyles: Record<EventStatus, { color: string; bg: string }> = {
  Success: { color: "#059669", bg: "rgba(5,150,105,0.08)" },
  Failed: { color: "#EF4444", bg: "#FEF2F2" },
  Blocked: { color: "#EF4444", bg: "#FEF2F2" },
  Warning: { color: "#D97706", bg: "#FFFBEB" },
  Info: { color: "#2563EB", bg: "#EFF6FF" },
};

/** Human label per backend `AuditAction`. */
export const actionLabels: Record<AuditAction, string> = {
  CREATE: "Created Record",
  UPDATE: "Updated Record",
  DELETE: "Deleted Record",
  STATUS_CHANGE: "Status Change",
  APPROVE: "Approved",
  REJECT: "Rejected",
};

/**
 * Status pill per backend action. Includes the security/auth actions the
 * backend also emits (login, OTP, permission, session) so failed/blocked
 * events colour correctly and feed the Security KPI card.
 */
export const actionStatus: Record<string, EventStatus> = {
  CREATE: "Success",
  UPDATE: "Success",
  DELETE: "Warning",
  STATUS_CHANGE: "Info",
  APPROVE: "Success",
  REJECT: "Failed",
  // Security / auth events
  LOGIN_SUCCESS: "Success",
  LOGIN_FAILED: "Failed",
  LOGIN_LOCKED: "Blocked",
  OTP_ISSUED: "Info",
  OTP_VERIFIED: "Success",
  OTP_FAILED: "Failed",
  PASSWORD_RESET_REQUESTED: "Info",
  PASSWORD_RESET_COMPLETED: "Success",
  PASSWORD_CHANGED: "Success",
  PASSWORD_EXPIRED: "Warning",
  PERMISSION_DENIED: "Blocked",
  REFRESH_TOKEN_REUSED: "Blocked",
  SESSION_REVOKED: "Info",
};

/** `"All"` plus the real `AuditAction` values — these drive the backend `action` filter. */
export const eventTypeOptions: Array<"All" | AuditAction> = [
  "All",
  "CREATE",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
  "APPROVE",
  "REJECT",
];

/** Two initials from a performedBy string (email / name / id). */
export function deriveInitials(performedBy: string): string {
  const cleaned = performedBy.trim();
  if (!cleaned) return "?";
  if (cleaned.includes("@")) return cleaned.slice(0, 2).toUpperCase();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}
