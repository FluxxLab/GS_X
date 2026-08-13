'use client';

import { useState, useCallback } from 'react';
import type { SalaryGrade, CreateSalaryGradePayload } from '@/lib/types/salary-grade';
import { createSalaryGradeSchema } from '@/lib/validation/settings';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { EMPTY_SALARY_GRADE_FORM } from '@/lib/constants/salary-grade';

interface Options {
  onCreate: (payload: CreateSalaryGradePayload) => Promise<unknown>;
  onUpdate: (id: string, payload: CreateSalaryGradePayload) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Owns the create/edit salary-grade form: a single values object, zod validation
 * at the boundary, edit-prefill, and submit. The page wires the mutations and a
 * success callback. Behavior preserved from the original page.
 */
export function useSalaryGradeForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [values, setValues] = useState<CreateSalaryGradePayload>(EMPTY_SALARY_GRADE_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<SalaryGrade | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof CreateSalaryGradePayload>(key: K, value: CreateSalaryGradePayload[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setEditing(null);
    setValues(EMPTY_SALARY_GRADE_FORM);
    setSubmitError(null);
    setErrors({});
  }, []);

  const loadForEdit = useCallback((grade: SalaryGrade) => {
    setEditing(grade);
    setValues({
      level: grade.level,
      label: grade.label,
      description: grade.description || '',
      minimumSalary: Number(grade.minimumSalary),
      maximumSalary: Number(grade.maximumSalary),
      steps: grade.steps,
      currency: grade.currency,
      isActive: grade.isActive,
      sortOrder: grade.sortOrder,
    });
    setSubmitError(null);
    setErrors({});
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const parsed = createSalaryGradeSchema.safeParse({
        level: values.level,
        label: values.label,
        minimumSalary: values.minimumSalary,
        maximumSalary: values.maximumSalary,
      });
      if (!parsed.success) {
        setErrors(zodFieldErrors(parsed.error));
        return;
      }
      setErrors({});
      setSubmitting(true);
      setSubmitError(null);
      try {
        if (editing) {
          await onUpdate(editing.id, values);
        } else {
          await onCreate(values);
        }
        onSuccess();
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to save salary grade');
      } finally {
        setSubmitting(false);
      }
    },
    [values, editing, onCreate, onUpdate, onSuccess],
  );

  return { values, setField, errors, editing, submitting, submitError, loadForEdit, reset, submit };
}
