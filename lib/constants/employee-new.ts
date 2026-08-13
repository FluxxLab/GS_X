import type { ReactNode } from "react";

/**
 * Static display data for the Add-New-Employee (Org Structure) step page
 * (`app/dashboard/employees/new`). This page is a static mockup — these are
 * the hardcoded labels/options it renders, lifted out of the component so the
 * page is a thin composition of co-located sections.
 */

export const NEW_EMPLOYEE_FONT = "var(--font-inter), Inter, sans-serif";

export interface ActivationStep {
  label: string;
  sub: string;
  status: "done" | "active" | "pending";
}

export const NEW_EMPLOYEE_STEPS: ActivationStep[] = [
  { label: "Personal Info", sub: "Completed", status: "done" },
  { label: "Org Structure", sub: "In Progress", status: "active" },
  { label: "Documents", sub: "Not Started", status: "pending" },
  { label: "Review", sub: "Not Started", status: "pending" },
];

/** Options rendered by the Department-style select fields in the mockup. */
export const NEW_EMPLOYEE_SELECT_OPTIONS = ["Engineering", "Finance", "Operations", "HR"];

export interface ContextCard {
  iconBg: string;
  iconColor: string;
  icon: ReactNode;
  title: string;
  body: string;
}
