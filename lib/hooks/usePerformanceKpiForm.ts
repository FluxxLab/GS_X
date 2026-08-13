'use client';

import { useState, useCallback } from 'react';
import type { CreateKpiPayload } from '@/lib/types/performance';
import { createKpiSchema } from '@/lib/validation/performance';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { CURRENT_QUARTER, CURRENT_YEAR } from '@/lib/constants/performance';

const empty = (): CreateKpiPayload => ({
  title: '', employeeId: '', quarter: CURRENT_QUARTER, year: CURRENT_YEAR,
  targetValue: 0, unit: 'number', weight: 1,
});

interface Options {
  onCreate: (payload: CreateKpiPayload) => void;
}

/**
 * Owns the set-KPI form: a single values object, zod validation at the
 * boundary, and submit. The page wires the create mutation.
 */
export function usePerformanceKpiForm({ onCreate }: Options) {
  const [values, setValues] = useState<CreateKpiPayload>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof CreateKpiPayload>(key: K, value: CreateKpiPayload[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(empty());
    setErrors({});
  }, []);

  const submit = useCallback(() => {
    const parsed = createKpiSchema.safeParse({
      title: values.title,
      employeeId: values.employeeId,
      targetValue: values.targetValue,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onCreate(values);
  }, [values, onCreate]);

  // The original page disabled submit until these were filled — preserve that.
  const canSubmit = !!values.title && !!values.employeeId && !!values.targetValue;

  return { values, setField, errors, reset, submit, canSubmit };
}
