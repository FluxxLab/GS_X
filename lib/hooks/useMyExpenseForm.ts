'use client';

import { useState, useCallback } from 'react';
import type { CreateExpensePayload, UpdateExpensePayload, Expense, ExpenseCategory } from '@/lib/types/finance';
import { createExpenseClaimSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface MyExpenseFormValues {
  date: string;
  category: string;
  vendor: string;
  description: string;
  amount: string;
  budgetId: string;
  notes: string;
}

const EMPTY: MyExpenseFormValues = {
  date: '', category: '', vendor: '', description: '', amount: '', budgetId: '', notes: '',
};

interface Options {
  onCreate: (payload: CreateExpensePayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateExpensePayload) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Submit-expense form (employee self-service): single values object, zod gate
 * (reusing the shared createExpenseClaimSchema), and payload build. Mirrors the
 * original page's handleSubmit byte-for-byte (including vendor fallback "N/A").
 */
export function useMyExpenseForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [values, setValues] = useState<MyExpenseFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof MyExpenseFormValues>(key: K, value: MyExpenseFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setError(null); setErrors({}); setEditingId(null); }, []);

  const loadForEdit = useCallback((exp: Expense) => {
    setError(null);
    setErrors({});
    setEditingId(exp.id);
    setValues({
      date: exp.date ? exp.date.split('T')[0] : '',
      category: exp.category ?? '',
      vendor: exp.vendorName && exp.vendorName !== 'N/A' ? exp.vendorName : '',
      description: exp.description ?? '',
      amount: exp.amount != null ? String(exp.amount) : '',
      budgetId: exp.budgetId ?? '',
      notes: '',
    });
  }, []);

  const submit = useCallback(async () => {
    setError(null);
    const parsed = createExpenseClaimSchema.safeParse({
      date: values.date,
      category: values.category,
      description: values.description,
      amount: parseFloat(values.amount.replace(/,/g, '')),
      budgetId: values.budgetId,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    const payload = {
      date: values.date,
      category: values.category as ExpenseCategory,
      vendorName: values.vendor || 'N/A',
      description: values.description,
      amount: parseFloat(values.amount.replace(/,/g, '')),
      budgetId: values.budgetId,
    };

    try {
      if (editingId) await onUpdate(editingId, payload);
      else await onCreate(payload);
      onSuccess();
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${editingId ? 'update' : 'submit'} expense.`);
    }
  }, [values, editingId, onCreate, onUpdate, onSuccess, reset]);

  return { values, setField, errors, error, setError, reset, submit, loadForEdit, editingId };
}
