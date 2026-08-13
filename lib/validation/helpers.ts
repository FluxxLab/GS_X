import type { ZodError } from 'zod';

/**
 * Flatten a ZodError into a `{ field: message }` map for inline form display.
 * Keeps the first message per field.
 */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
