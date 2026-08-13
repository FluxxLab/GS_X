'use client';

import { useState, useCallback } from 'react';
import { userService } from '@/lib/services/user.service';
import type { User } from '@/lib/types/user';
import type { CreateDepartmentPayload, Department, DepartmentStatus } from '@/lib/types/department';
import { createDepartmentSchema } from '@/lib/validation/settings';
import { zodFieldErrors } from '@/lib/validation/helpers';

interface DepartmentFormValues {
  name: string;
  code: string;
  description: string;
  head: string; // stores "userId::fullName"
  status: DepartmentStatus;
}

const EMPTY_VALUES: DepartmentFormValues = {
  name: '',
  code: '',
  description: '',
  head: '',
  status: 'active',
};

interface Options {
  onCreate: (data: CreateDepartmentPayload) => Promise<Department>;
  onUpdate: (id: string, data: CreateDepartmentPayload) => Promise<Department>;
  onSuccess: () => void;
}

/**
 * Owns the department form in both modes: a single values object, the
 * available-users fetch for the head dropdown, zod validation at the
 * boundary, and the head "userId::fullName" payload shaping. `startEdit`
 * prefills from an existing department and submit routes to update.
 */
export function useDepartmentForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [values, setValues] = useState<DepartmentFormValues>(EMPTY_VALUES);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof DepartmentFormValues>(key: K, value: DepartmentFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(EMPTY_VALUES);
    setEditingId(null);
    setFormError(null);
    setFieldErrors({});
    userService
      .getAll({ limit: 100, status: 'active' })
      .then((res) => setAvailableUsers(res.data))
      .catch(() => {});
  }, []);

  /** Prefill from an existing department and switch submit to update. */
  const startEdit = useCallback((dept: Department) => {
    setEditingId(dept.id);
    setFormError(null);
    setFieldErrors({});
    setValues({
      name: dept.name ?? '',
      code: dept.code ?? '',
      description: dept.description ?? '',
      head: '', // rebuilt below once the users list arrives
      status: dept.status,
    });
    userService
      .getAll({ limit: 100, status: 'active' })
      .then((res) => {
        setAvailableUsers(res.data);
        // The head select stores "userId::fullName"; the department only
        // stores headEmployeeId + headName, so match the user back by id.
        const head = dept.headEmployeeId
          ? res.data.find((u) => u.employeeId === dept.headEmployeeId)
          : undefined;
        if (head) {
          setValues((prev) => ({
            ...prev,
            head: `${head.id}::${[head.firstName, head.lastName].filter(Boolean).join(' ')}`,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const submit = useCallback(async () => {
    const parsed = createDepartmentSchema.safeParse({ name: values.name, code: values.code });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setFormError(null);
    try {
      // head format: "userId::fullName"
      const [headUserId, headName] = values.head ? values.head.split('::') : [undefined, undefined];
      const selectedUser = headUserId ? availableUsers.find((u) => u.id === headUserId) : undefined;

      const payload = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        description: values.description.trim() || undefined,
        headName: headName || undefined,
        headEmployeeId: selectedUser?.employeeId || undefined,
        status: values.status,
      };
      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : `Failed to ${editingId ? 'update' : 'create'} department`,
      );
    } finally {
      setSubmitting(false);
    }
  }, [values, availableUsers, editingId, onCreate, onUpdate, onSuccess]);

  return { values, setField, availableUsers, submitting, formError, fieldErrors, reset, startEdit, editingId, submit };
}
