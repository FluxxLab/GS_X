import { z } from "zod";

/**
 * Validation for the assign-task form (§6). Mirrors the original required-field
 * gate (title, assignee, due date) — non-blocking beyond what the page enforced.
 */
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  assigneeId: z.string().trim().min(1, "Please select an employee"),
  dueDate: z.string().min(1, "Due date is required"),
});

/**
 * Validation for the set-KPI form (§6). Mirrors the original required-field gate
 * (title, employee, target value).
 */
export const createKpiSchema = z.object({
  title: z.string().trim().min(1, "KPI title is required"),
  employeeId: z.string().trim().min(1, "Please select an employee"),
  targetValue: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, "Target must be greater than 0"),
});
