import { z } from 'zod';

/**
 * Validation for the create/edit-invoice form (§6).
 *
 * NOTE: the original invoices page had no zod schema — it gated submit with a
 * plain `if (!customer || !issueDate || !dueDate) return;`. This schema encodes
 * exactly those three required fields so behavior is unchanged (non-blocking
 * additions only). Lives here (not finance.ts) because finance.ts is shared and
 * being edited concurrently.
 */
export const createInvoiceSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer is required'),
  issueDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
});
