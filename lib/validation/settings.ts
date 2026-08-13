import { z } from 'zod';

/** Validation for the create-department form (§6). */
export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, 'Department name is required'),
  code: z.string().trim().min(1, 'Department code is required'),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

/** Validation for the create/edit-salary-grade form (§6). */
export const createSalaryGradeSchema = z
  .object({
    level: z.string().trim().min(1, 'Level is required'),
    label: z.string().trim().min(1, 'Label is required'),
    minimumSalary: z
      .number()
      .refine((n) => Number.isFinite(n) && n > 0, 'Minimum salary must be greater than 0'),
    maximumSalary: z
      .number()
      .refine((n) => Number.isFinite(n) && n > 0, 'Maximum salary must be greater than 0'),
  })
  .refine((v) => v.maximumSalary > v.minimumSalary, {
    message: 'Maximum salary must be greater than minimum salary',
    path: ['maximumSalary'],
  });

export type CreateSalaryGradeInput = z.infer<typeof createSalaryGradeSchema>;

/** Validation for the create/edit-approval-level form (§6). */
export const createApprovalLevelSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  role: z.string().trim().min(1, 'Role is required'),
});

export type CreateApprovalLevelInput = z.infer<typeof createApprovalLevelSchema>;

/** Validation for the create/edit-lookup form (HR configuration, §6). */
export const createLookupSchema = z.object({
  value: z.string().trim().min(1, 'Value is required'),
  label: z.string().trim().min(1, 'Label is required'),
});

export type CreateLookupInput = z.infer<typeof createLookupSchema>;
