'use client';

import { useState, useCallback } from 'react';
import type { LeaveType, LeaveDayPart } from '@/lib/types/attendance';
import { leaveRequestSchema } from '@/lib/validation/attendance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface LeaveRequestFormValues {
  leaveType: LeaveType | '';
  startDate: string;
  endDate: string;
  dayPart: LeaveDayPart;
  reason: string;
}

const EMPTY: LeaveRequestFormValues = { leaveType: '', startDate: '', endDate: '', dayPart: 'full', reason: '' };

interface Options {
  onCreate: (payload: { leaveType: LeaveType; startDate: string; endDate: string; dayPart: LeaveDayPart; reason?: string }) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create-leave-request form: values + zod validation at the boundary + payload build. */
export function useLeaveRequestForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<LeaveRequestFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof LeaveRequestFormValues>(key: K, value: LeaveRequestFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  const submit = useCallback(async () => {
    // A half-day is a single day — end date always mirrors the start date.
    const isHalf = values.dayPart !== 'full';
    const endDate = isHalf ? values.startDate : values.endDate;

    const parsed = leaveRequestSchema.safeParse({
      leaveType: values.leaveType,
      startDate: values.startDate,
      endDate,
      reason: values.reason,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    try {
      await onCreate({
        leaveType: values.leaveType as LeaveType,
        startDate: values.startDate,
        endDate,
        dayPart: values.dayPart,
        reason: values.reason || undefined,
      });
      onSuccess();
    } catch {
      // error surfaced via the mutation's error state in the modal
    }
  }, [values, onCreate, onSuccess]);

  return { values, setField, errors, reset, submit };
}
