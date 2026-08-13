import { describe, it, expect } from 'vitest';
import { createSeparationSchema, submitResignationSchema, createEmployeeSchema } from './hr';
import { zodFieldErrors } from './helpers';

describe('createEmployeeSchema', () => {
  const valid = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@maizube.com',
    employeeId: 'EMP-001',
    hireDate: '2026-06-21',
  };

  it('accepts the five required fields', () => {
    expect(createEmployeeSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an optional isDraft boolean', () => {
    expect(createEmployeeSchema.safeParse({ ...valid, isDraft: true }).success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const r = createEmployeeSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).email).toBeTruthy();
  });

  it('requires firstName, lastName, email, employeeId and hireDate', () => {
    const r = createEmployeeSchema.safeParse({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      hireDate: '',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.firstName).toBeTruthy();
      expect(e.lastName).toBeTruthy();
      expect(e.email).toBeTruthy();
      expect(e.employeeId).toBeTruthy();
      expect(e.hireDate).toBeTruthy();
    }
  });
});

describe('createSeparationSchema', () => {
  const valid = {
    employeeName: 'John Doe',
    department: 'Operations',
    type: 'RESIGNATION',
    reason: 'Relocating abroad',
    effectiveDate: '2026-06-21',
    lastWorkingDay: '2026-07-21',
  };

  it('accepts a valid separation', () => {
    expect(createSeparationSchema.safeParse(valid).success).toBe(true);
  });

  it('requires employee, department, type, reason and dates', () => {
    const r = createSeparationSchema.safeParse({
      employeeName: '',
      department: '',
      type: '',
      reason: '',
      effectiveDate: '',
      lastWorkingDay: '',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.employeeName).toBeTruthy();
      expect(e.department).toBeTruthy();
      expect(e.type).toBeTruthy();
      expect(e.reason).toBeTruthy();
      expect(e.effectiveDate).toBeTruthy();
      expect(e.lastWorkingDay).toBeTruthy();
    }
  });

  it('rejects a missing required field individually', () => {
    expect(createSeparationSchema.safeParse({ ...valid, employeeName: '  ' }).success).toBe(false);
    expect(createSeparationSchema.safeParse({ ...valid, effectiveDate: '' }).success).toBe(false);
  });
});

describe('submitResignationSchema', () => {
  const valid = { reason: 'Relocating abroad', lastWorkingDay: '2026-07-21' };

  it('accepts a valid resignation', () => {
    expect(submitResignationSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a reason and last working day', () => {
    const r = submitResignationSchema.safeParse({ reason: '  ', lastWorkingDay: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.reason).toBeTruthy();
      expect(e.lastWorkingDay).toBeTruthy();
    }
  });
});
