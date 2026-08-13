import type { Monitor } from "lucide-react";
import { UsersRound, DollarSign, Settings, Package, FolderKanban, Wrench } from "lucide-react";

/**
 * Display maps, the static role→permissions matrix, and pure formatters for the
 * user profile page. Neutral constants module — never imports from `app/`.
 */

export const PROFILE_TABS = ["Overview", "Security", "Permissions", "Activity Log", "Sessions"];

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  managing_director: "CEO / Managing Director",
  finance_controller: "Finance Controller",
  hr_manager: "HR Manager",
  warehouse_manager: "Warehouse Manager",
  operations_manager: "Operations Manager",
  department_head: "Department Head",
  employee: "Employee",
};

export const ACCESS_SCOPE_LABELS: Record<string, string> = {
  all: "All Departments",
  department: "Own Department Only",
  team: "Own Team Only",
  self: "Self Only",
};

// Role-based permissions (static mapping per role)
export const ROLE_PERMISSIONS: Record<string, Record<string, Record<string, boolean>>> = {
  super_admin: {
    HR: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
    Finance: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
    Operations: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
    Inventory: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
    Projects: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
    Settings: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
  },
  hr_manager: {
    HR: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
    Finance: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Operations: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Inventory: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Projects: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Settings: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
  },
  finance_controller: {
    HR: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Finance: { View: true, Create: true, Edit: true, Delete: false, Approve: true },
    Operations: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Inventory: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Projects: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Settings: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
  },
  warehouse_manager: {
    HR: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Finance: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Operations: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Inventory: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
    Projects: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Settings: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
  },
  operations_manager: {
    HR: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Finance: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Operations: { View: true, Create: true, Edit: true, Delete: true, Approve: true },
    Inventory: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Projects: { View: true, Create: true, Edit: true, Delete: false, Approve: false },
    Settings: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
  },
  department_head: {
    HR: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Finance: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Operations: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Inventory: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Projects: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Settings: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
  },
  employee: {
    HR: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Finance: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Operations: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Inventory: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
    Projects: { View: true, Create: false, Edit: false, Delete: false, Approve: false },
    Settings: { View: false, Create: false, Edit: false, Delete: false, Approve: false },
  },
};

export const MODULE_ICONS: Record<string, typeof Monitor> = {
  HR: UsersRound,
  Finance: DollarSign,
  Operations: Wrench,
  Inventory: Package,
  Projects: FolderKanban,
  Settings: Settings,
};

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16A34A" },
  suspended: { bg: "#FFFBEB", color: "#D97706" },
  pending: { bg: "#EFF6FF", color: "#2563EB" },
  deactivated: { bg: "#FEF2F2", color: "#EF4444" },
};

export const ACTION_COLORS: Record<string, string> = {
  CREATE: "#3B82F6",
  UPDATE: "#F59E0B",
  DELETE: "#EF4444",
  STATUS_CHANGE: "#8B5CF6",
  APPROVE: "#22C55E",
  REJECT: "#EF4444",
  // Security events
  LOGIN_SUCCESS: "#22C55E",
  LOGIN_FAILED: "#F59E0B",
  LOGIN_LOCKED: "#EF4444",
  OTP_ISSUED: "#3B82F6",
  OTP_VERIFIED: "#22C55E",
  OTP_FAILED: "#F59E0B",
  PASSWORD_RESET_REQUESTED: "#3B82F6",
  PASSWORD_RESET_COMPLETED: "#22C55E",
  PASSWORD_CHANGED: "#8B5CF6",
  PASSWORD_EXPIRED: "#F59E0B",
  PERMISSION_DENIED: "#EF4444",
  REFRESH_TOKEN_REUSED: "#EF4444",
  SESSION_REVOKED: "#70768E",
};

export const ACTION_LABELS: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  STATUS_CHANGE: "Changed status of",
  APPROVE: "Approved",
  REJECT: "Rejected",
  // Security events — full, self-contained phrases
  LOGIN_SUCCESS: "Signed in",
  LOGIN_FAILED: "Failed sign-in attempt",
  LOGIN_LOCKED: "Account locked after failed attempts",
  OTP_ISSUED: "One-time code sent",
  OTP_VERIFIED: "One-time code verified",
  OTP_FAILED: "Incorrect one-time code entered",
  PASSWORD_RESET_REQUESTED: "Requested a password reset",
  PASSWORD_RESET_COMPLETED: "Completed a password reset",
  PASSWORD_CHANGED: "Changed password",
  PASSWORD_EXPIRED: "Password expired",
  PERMISSION_DENIED: "Access denied",
  REFRESH_TOKEN_REUSED: "Suspicious session activity detected",
  SESSION_REVOKED: "Session ended",
};

/** CRUD actions whose label is a verb that reads with the entity ("Created invoice"). */
const VERB_ACTIONS = new Set([
  "CREATE",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
  "APPROVE",
  "REJECT",
]);

/** A friendly label for an action, falling back to Sentence-cased text. */
export function humanizeAction(action: string): string {
  return (
    ACTION_LABELS[action] ||
    (action
      ? action.charAt(0).toUpperCase() +
        action.slice(1).toLowerCase().replace(/_/g, " ")
      : "Activity")
  );
}

/** A friendly, title-cased entity name ("user" → "User", "work_order" → "Work order"). */
export function humanizeEntity(entityType: string): string {
  const s = (entityType || "").replace(/_/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

/** A one-line, human-readable description for an audit entry. */
export function humanizeActivity(entry: {
  action: string;
  entityType: string;
  description?: string | null;
}): string {
  if (entry.description) return entry.description;
  const label = humanizeAction(entry.action);
  // Verb actions read with the entity; security phrases stand alone.
  return VERB_ACTIONS.has(entry.action)
    ? `${label} ${humanizeEntity(entry.entityType).toLowerCase()}`.trim()
    : label;
}

export const font = "var(--font-inter), Inter, sans-serif";

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
