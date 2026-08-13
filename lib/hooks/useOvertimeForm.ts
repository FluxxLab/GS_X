'use client';

import { useState, useCallback } from 'react';
import { overtimeRequestSchema } from '@/lib/validation/attendance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface OvertimeFormValues {
  date: string;
  expectedHours: string;
  reason: string;
}

const EMPTY: OvertimeFormValues = { date: '', expectedHours: '', reason: '' };

interface Options {
  onCreate: (payload: { date: string; expectedHours: number; reason?: string }) => Promise<unknown>;
  onSuccess: () => void;
  onError: (message: string) => void;
}

/** Create-overtime form: values + zod validation at the boundary + payload build. */
export function useOvertimeForm({ onCreate, onSuccess, onError }: Options) {
  const [values, setValues] = useState<OvertimeFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof OvertimeFormValues>(key: K, value: OvertimeFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  const submit = useCallback(async () => {
    const parsed = overtimeRequestSchema.safeParse({
      date: values.date,
      expectedHours: parseFloat(values.expectedHours),
      reason: values.reason,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    try {
      await onCreate({
        date: values.date,
        expectedHours: parseFloat(values.expectedHours),
        reason: values.reason || undefined,
      });
      onSuccess();
    } catch (err) {
      onError((err as Error)?.message || 'Failed to create overtime request');
    }
  }, [values, onCreate, onSuccess, onError]);

  return { values, setField, errors, reset, submit };
}
