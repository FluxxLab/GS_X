'use client';

import { useState, useCallback } from 'react';
import type { CreateTaskPayload, TaskPriority } from '@/lib/types/performance';
import { createTaskSchema } from '@/lib/validation/performance';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { CURRENT_QUARTER } from '@/lib/constants/performance';

const empty = (): CreateTaskPayload => ({
  title: '', assigneeId: '', dueDate: '', priority: 'medium', quarter: CURRENT_QUARTER,
});

interface Options {
  onCreate: (payload: CreateTaskPayload) => void;
}

/**
 * Owns the assign-task form: a single values object, zod validation at the
 * boundary, and submit. The page wires the create mutation.
 */
export function usePerformanceTaskForm({ onCreate }: Options) {
  const [values, setValues] = useState<CreateTaskPayload>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof CreateTaskPayload>(key: K, value: CreateTaskPayload[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(empty());
    setErrors({});
  }, []);

  const submit = useCallback(() => {
    const parsed = createTaskSchema.safeParse({
      title: values.title,
      assigneeId: values.assigneeId,
      dueDate: values.dueDate,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onCreate(values);
  }, [values, onCreate]);

  // The original page disabled submit until these were filled — preserve that.
  const canSubmit = !!values.title && !!values.assigneeId && !!values.dueDate;

  return { values, setField, errors, reset, submit, canSubmit };
}

export type { TaskPriority };
