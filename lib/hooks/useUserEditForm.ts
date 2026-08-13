'use client';

import { useCallback, useState } from 'react';
import type { User, UpdateUserPayload } from '@/lib/types/user';

interface Options {
  /** Persists the edit payload; returns the updated user. */
  onSave: (payload: UpdateUserPayload) => Promise<User>;
  /** Called after a successful save (e.g. to close the modal). */
  onSuccess: () => void;
}

/**
 * Owns the edit-user modal form: a single `values` object (not a useState per
 * field), prefill-on-open, saving/error state with a double-submit guard, and
 * submit. The original form had no zod validation, so submit stays
 * non-blocking — behavior preserved.
 */
export function useUserEditForm({ onSave, onSuccess }: Options) {
  const [values, setValues] = useState<UpdateUserPayload>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof UpdateUserPayload>(key: K, value: UpdateUserPayload[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const prefill = useCallback((user: User) => {
    setValues({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || undefined,
      role: user.role,
      jobTitle: user.jobTitle || undefined,
      accessScope: user.accessScope,
      approvalLevel: user.approvalLevel ?? undefined,
      canApprove: user.canApprove,
    });
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [values, onSave, onSuccess]);

  return { values, setField, saving, error, prefill, submit };
}

export type UserEditForm = ReturnType<typeof useUserEditForm>;
