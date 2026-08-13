'use client';

import { useState, useCallback } from 'react';
import { emptyPermMap, type PermMap } from '@/lib/constants/user-role';
import { createRoleSchema } from '@/lib/validation/role';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface RoleFormValues {
  name: string;
  description: string;
}

const EMPTY: RoleFormValues = { name: '', description: '' };

interface Options {
  onSuccess: () => void;
}

/**
 * Owns the create-role form: a single values object, the per-module permission
 * matrix, and a non-blocking zod validation pass.
 *
 * NOTE: the original "Create" button was a no-op — it closed the modal without
 * persisting anything. `submit` preserves that (it always calls `onSuccess`);
 * validation is computed for inline display but never blocks submit (§6
 * non-blocking, since the original form had no validation at all).
 */
export function useRoleForm({ onSuccess }: Options) {
  const [values, setValues] = useState<RoleFormValues>(EMPTY);
  const [permissions, setPermissions] = useState<PermMap>(emptyPermMap);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof RoleFormValues>(key: K, value: RoleFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const togglePermission = useCallback((mod: string, perm: string) => {
    setPermissions((prev) => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [perm]: !prev[mod][perm],
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setValues(EMPTY);
    setPermissions(emptyPermMap());
    setErrors({});
  }, []);

  const submit = useCallback(() => {
    const parsed = createRoleSchema.safeParse(values);
    setErrors(parsed.success ? {} : zodFieldErrors(parsed.error));
    // Non-blocking: the original "Create" button only closed the modal.
    onSuccess();
  }, [values, onSuccess]);

  return { values, setField, permissions, togglePermission, errors, reset, submit };
}
