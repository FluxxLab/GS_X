import { z } from 'zod';

/**
 * Validation for the create-user wizard (§6). Mirrors the original per-step
 * checks: step 1 requires full name + department; step 2 requires a role.
 */
export const createUserStep1Schema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  department: z.string().min(1, 'Department is required'),
});

export const createUserStep2Schema = z.object({
  role: z.string().min(1, 'Role is required'),
});
