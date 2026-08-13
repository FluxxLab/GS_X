'use client';

import { useCallback, useState } from 'react';
import type { ZodType } from 'zod';
import { zodFieldErrors } from '@/lib/validation/helpers';
import type { Employee, UpdateEmployeePayload } from '@/lib/types/employee';

interface Options {
  /** Picks the editable slice of the employee to prefill the form with. */
  prefill: (emp: Employee) => UpdateEmployeePayload;
  /** Persists the section payload; returns the updated employee. */
  onSave: (payload: UpdateEmployeePayload) => Promise<Employee>;
  /** Optional zod schema validated at the submit boundary (§6). */
  schema?: ZodType;
}

/**
 * Owns one employee-profile edit section's form: a single `values` object (not
 * a useState per field), open/close + saving/error state, prefill-on-open, zod
 * validation at the boundary, and submit. Each card in the page wires its own
 * instance with the slice it edits.
 */
export function useEmployeeSectionForm({ prefill, onSave, schema }: Options) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<UpdateEmployeePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof UpdateEmployeePayload>(key: K, value: UpdateEmployeePayload[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const openFor = useCallback(
    (emp: Employee) => {
      setValues(prefill(emp));
      setErrors({});
      setError(null);
      setOpen(true);
    },
    [prefill],
  );

  const close = useCallback(() => setOpen(false), []);

  const submit = useCallback(async () => {
    if (schema) {
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        setErrors(zodFieldErrors(parsed.error));
        return;
      }
    }
    setErrors({});
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [schema, values, onSave]);

  return { open, values, setField, errors, saving, error, openFor, close, submit };
}

export type EmployeeSectionForm = ReturnType<typeof useEmployeeSectionForm>;
