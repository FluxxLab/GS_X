import { z } from 'zod';

/**
 * Validation for the create-role form. The original page had NO validation and
 * its "Create" button was a no-op (it just closed the modal) — so this schema
 * is wired NON-BLOCKING in `useRoleForm` to preserve behavior exactly, while
 * still providing the standard zod + `zodFieldErrors` shape (§6).
 */
export const createRoleSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required'),
  description: z.string().trim().optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
