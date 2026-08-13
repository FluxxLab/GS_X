'use client';

import { useState, useCallback } from 'react';
import type { SeparationType, NoticeType, CreateSeparationPayload } from '@/lib/types/separation';
import { createSeparationSchema } from '@/lib/validation/hr';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface SeparationFormValues {
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  separationType: string;
  reason: string;
  effectiveDate: string;
  lastWorkingDay: string;
  noticePeriod: string;
  noticeType: string;
  notes: string;
}

const EMPTY: SeparationFormValues = {
  employeeId: '', employeeName: '', department: '', jobTitle: '', separationType: '', reason: '',
  effectiveDate: '', lastWorkingDay: '', noticePeriod: '30', noticeType: '', notes: '',
};

interface Options {
  onCreate: (payload: CreateSeparationPayload) => Promise<{ id: string }>;
  onSuccess: (id: string) => void;
}

/**
 * Initiate-separation form: single values object + zod validation at the
 * boundary + payload build. Mirrors the original page's behavior — the
 * "Save as Draft" and "Submit" buttons both run the same submit (the `draft`
 * flag was never used downstream), so this hook exposes one `submit`.
 */
export function useSeparationForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<SeparationFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback(
    <K extends keyof SeparationFormValues>(key: K, value: SeparationFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const submit = useCallback(async () => {
    const parsed = createSeparationSchema.safeParse({
      employeeName: values.employeeName,
      department: values.department,
      type: values.separationType,
      reason: values.reason,
      effectiveDate: values.effectiveDate,
      lastWorkingDay: values.lastWorkingDay,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload: CreateSeparationPayload = {
        employeeId: values.employeeId || undefined,
        employeeName: values.employeeName,
        department: values.department,
        jobTitle: values.jobTitle,
        type: values.separationType as SeparationType,
        reason: values.reason,
        effectiveDate: values.effectiveDate,
        lastWorkingDay: values.lastWorkingDay,
        noticePeriodDays: parseInt(values.noticePeriod) || 30,
        noticeType: (values.noticeType as NoticeType) || undefined,
        notes: values.notes || undefined,
      };
      const result = await onCreate(payload);
      onSuccess(result.id);
    } catch (err) {
      console.error('Failed to create separation:', err);
    } finally {
      setSubmitting(false);
    }
  }, [values, onCreate, onSuccess]);

  return { values, setField, errors, submitting, submit };
}
