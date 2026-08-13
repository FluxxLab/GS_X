/**
 * Display lists + role→permissions map for the create-user wizard.
 * Neutral constants module — never imports from `app/`.
 */

import type { UserRole, UserStatus, AccessScope } from "@/lib/types/user";

export const DEPARTMENTS = ["HR", "Finance", "Operations", "Inventory", "Admin", "IT"];

// ─── Display-label → backend-enum maps (used when submitting to the API) ──────
export const ROLE_TO_ENUM: Record<string, UserRole> = {
  "Super Admin": "super_admin",
  "HR Manager": "hr_manager",
  "Finance Officer": "finance_controller",
  "Inventory Officer": "warehouse_manager",
  "Operations Manager": "operations_manager",
  Employee: "employee",
};

export const ACCESS_SCOPE_TO_ENUM: Record<string, AccessScope> = {
  "All Departments": "all",
  "Own Department Only": "department",
  "Own Team Only": "team",
};

export const APPROVAL_LEVEL_TO_NUM: Record<string, number | undefined> = {
  None: undefined,
  "Level 1": 1,
  "Level 2": 2,
};

export const STATUS_TO_ENUM: Record<string, UserStatus> = {
  Active: "active",
  Pending: "pending",
};

export const ROLES = [
  "Super Admin",
  "HR Manager",
  "Finance Officer",
  "Inventory Officer",
  "Operations Manager",
  "Employee",
];

export const ACCESS_SCOPES = ["All Departments", "Own Department Only", "Own Team Only"];

export const APPROVAL_LEVELS = ["None", "Level 1", "Level 2"];

export const EMPLOYMENT_STATUSES = ["Active", "Pending"];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Super Admin": [
    "Full system access",
    "User management",
    "System configuration",
    "All module access",
    "Audit logs",
    "Role management",
  ],
  "HR Manager": [
    "Employee management",
    "Attendance tracking",
    "Leave approvals",
    "Payroll viewing",
    "Recruitment management",
    "Onboarding",
  ],
  "Finance Officer": [
    "Payroll processing",
    "Tax filing",
    "Invoice management",
    "Budget tracking",
    "Financial reports",
  ],
  "Inventory Officer": [
    "Stock management",
    "Purchase orders",
    "Warehouse management",
    "Inventory reports",
    "Supplier management",
  ],
  "Operations Manager": [
    "Project management",
    "Task assignment",
    "Operations reports",
    "Team management",
    "Resource planning",
  ],
  Employee: [
    "View own profile",
    "Submit leave requests",
    "View payslips",
    "Clock in/out",
    "View assigned tasks",
  ],
};

export const STEP_LABELS = ["Personal Information", "Role & Access", "Review & Create"];
