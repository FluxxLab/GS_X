import { z } from 'zod';

/** Validation for the initiate-employee-separation form (§6). */
export const createSeparationSchema = z.object({
  employeeName: z.string().trim().min(1, 'Employee name is required'),
  department: z.string().trim().min(1, 'Department is required'),
  type: z.string().trim().min(1, 'Separation type is required'),
  reason: z.string().trim().min(1, 'Reason is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  lastWorkingDay: z.string().min(1, 'Last working day is required'),
});

export type CreateSeparationInput = z.infer<typeof createSeparationSchema>;

/** Validation for the submit-resignation form (§6). */
export const submitResignationSchema = z.object({
  reason: z.string().trim().min(1, 'Reason for leaving is required'),
  lastWorkingDay: z.string().min(1, 'Proposed last working day is required'),
});

export type SubmitResignationInput = z.infer<typeof submitResignationSchema>;

/**
 * Boundary validation for the create-employee form (Add New Employee page).
 * Mirrors only the REQUIRED fields of the backend `CreateEmployeeDto`
 * (firstName, lastName, email, employeeId, hireDate); every other DTO field is
 * optional and validated by the backend.
 */
export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required'),
  lastName: z.string().trim().min(2, 'Last name is required'),
  email: z.string().trim().email('Enter a valid work email'),
  employeeId: z.string().trim().min(2, 'Employee ID is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  // Drafts still require the same required fields above; isDraft only routes
  // the record out of the active roster.
  isDraft: z.boolean().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/**
 * Boundary validation for the employee-profile edit sections (§6). The original
 * page submitted these with no client validation; these schemas only reject
 * clearly malformed email input (everything else stays optional) so behavior is
 * preserved while satisfying the "validate before submit" rule.
 */
const optionalEmail = z
  .string()
  .trim()
  .email('Enter a valid email')
  .optional()
  .or(z.literal(''));

export const editPersonalSchema = z.object({
  personalEmail: optionalEmail,
});

export const editEmergencyContactSchema = z.object({});

export const editNextOfKinSchema = z.object({
  nextOfKinEmail: optionalEmail,
});

export const editEmploymentSchema = z.object({});

export const editCompensationSchema = z.object({});

export const editHmoSchema = z.object({});
