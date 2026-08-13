import { z } from 'zod';

/**
 * Validation for employee lifecycle self-service flows (my-exit handover notes,
 * etc.). Owned by the employee-lifecycle refactor.
 *
 * NOTE: the original `my-exit` handover form only gated submit on a non-empty,
 * trimmed `title` and `description` (category always defaulted to a valid enum).
 * This schema preserves exactly that blocking behavior — title/description
 * required, the rest optional — and adds inline field-error surfacing.
 */

export const HANDOVER_CATEGORY_VALUES = [
  'ONGOING_PROJECT',
  'KEY_CONTACT',
  'SYSTEM_ACCESS',
  'PENDING_ITEM',
  'DOCUMENT_LOCATION',
  'GENERAL_NOTE',
] as const;

export const HANDOVER_PRIORITY_VALUES = ['HIGH', 'MEDIUM', 'LOW'] as const;

export const myExitHandoverSchema = z.object({
  category: z.enum(HANDOVER_CATEGORY_VALUES),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  priority: z.enum(HANDOVER_PRIORITY_VALUES),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

export type MyExitHandoverInput = z.infer<typeof myExitHandoverSchema>;
