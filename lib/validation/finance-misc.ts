import { z } from 'zod';

/**
 * New zod schemas for finance pages that previously had ad-hoc / no validation.
 * Shared finance schemas live in `finance.ts`; these are page-specific additions
 * kept separate to avoid collisions with concurrent edits to `finance.ts`.
 */

/** Validation for the finance-settings lookup create/edit form (§6). */
export const lookupEntrySchema = z.object({
  value: z.string().trim().min(1, 'Value is required'),
  label: z.string().trim().min(1, 'Label is required'),
});

/** Validation for the chart-of-accounts create/edit-account form (§6). */
export const chartOfAccountSchema = z.object({
  code: z.string().trim().min(1, 'Code and Name are required'),
  name: z.string().trim().min(1, 'Code and Name are required'),
});
