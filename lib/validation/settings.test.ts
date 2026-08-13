import { describe, it, expect } from 'vitest';
import { createDepartmentSchema, createSalaryGradeSchema, createLookupSchema, createApprovalLevelSchema } from './settings';
import { zodFieldErrors } from './helpers';

describe('createDepartmentSchema', () => {
  it('accepts a valid department', () => {
    expect(createDepartmentSchema.safeParse({ name: 'Finance', code: 'FIN' }).success).toBe(true);
  });

  it('requires a name and code', () => {
    const r = createDepartmentSchema.safeParse({ name: '  ', code: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.name).toBeTruthy();
      expect(e.code).toBeTruthy();
    }
  });
});

describe('createSalaryGradeSchema', () => {
  const valid = { level: 'GL-01', label: 'Entry Level', minimumSalary: 80000, maximumSalary: 120000 };

  it('accepts a valid grade', () => {
    expect(createSalaryGradeSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a level and label', () => {
    const r = createSalaryGradeSchema.safeParse({ ...valid, level: '  ', label: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.level).toBeTruthy();
      expect(e.label).toBeTruthy();
    }
  });

  it('rejects a zero minimum and a max not greater than min', () => {
    expect(createSalaryGradeSchema.safeParse({ ...valid, minimumSalary: 0 }).success).toBe(false);
    const r = createSalaryGradeSchema.safeParse({ ...valid, minimumSalary: 120000, maximumSalary: 120000 });
    expect(r.success).toBe(false);
    if (!r.success) expect(zodFieldErrors(r.error).maximumSalary).toBeTruthy();
  });
});

describe('createLookupSchema', () => {
  it('accepts a valid lookup entry', () => {
    expect(createLookupSchema.safeParse({ value: 'full_time', label: 'Full-time' }).success).toBe(true);
  });

  it('requires a value and label', () => {
    const r = createLookupSchema.safeParse({ value: '  ', label: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.value).toBeTruthy();
      expect(e.label).toBeTruthy();
    }
  });
});

describe('createApprovalLevelSchema', () => {
  it('accepts a valid approval level', () => {
    expect(createApprovalLevelSchema.safeParse({ name: 'Finance Officer', role: 'finance_officer' }).success).toBe(true);
  });

  it('requires a name and role', () => {
    const r = createApprovalLevelSchema.safeParse({ name: '  ', role: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.name).toBeTruthy();
      expect(e.role).toBeTruthy();
    }
  });
});
