import { describe, it, expect } from 'vitest';
import { remoteWorkRequestSchema } from './attendance';
import { zodFieldErrors } from './helpers';

describe('remoteWorkRequestSchema', () => {
  const valid = { startDate: '2026-06-21', endDate: '2026-06-25', reason: 'Childcare' };

  it('accepts a valid request', () => {
    expect(remoteWorkRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a request with no reason (optional)', () => {
    expect(remoteWorkRequestSchema.safeParse({ startDate: '2026-06-21', endDate: '2026-06-25' }).success).toBe(true);
  });

  it('requires start and end dates', () => {
    const r = remoteWorkRequestSchema.safeParse({ startDate: '', endDate: '', reason: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.startDate).toBeTruthy();
      expect(e.endDate).toBeTruthy();
    }
  });
});
