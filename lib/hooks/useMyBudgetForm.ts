'use client';

import { useState, useCallback } from 'react';
import type { Budget, CreateBudgetPayload } from '@/lib/types/finance';
import { createBudgetSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface BudgetLineRow { description: string; amount: string }

export interface MyBudgetFormValues {
  name: string;
  period: string;
  category: string;
  notes: string;
  lines: BudgetLineRow[];
}

const EMPTY: MyBudgetFormValues = {
  name: '', period: '', category: '', notes: '', lines: [{ description: '', amount: '' }],
};

interface Options {
  deptName: string;
  onCreate: (payload: CreateBudgetPayload) => Promise<Budget>;
  onUpdate: (id: string, payload: Partial<CreateBudgetPayload> & { status?: Budget['status'] }) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Create/edit-budget form (employee self-service): single values object with the
 * multi-line allocation list, zod gate (reusing the shared createBudgetSchema),
 * and payload build. Mirrors the original page's handleSubmit / openEdit exactly,
 * including the create-then-submit and update-then-submit flows.
 */
export function useMyBudgetForm({ deptName, onCreate, onUpdate, onSuccess }: Options) {
  const [values, setValues] = useState<MyBudgetFormValues>(EMPTY);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof MyBudgetFormValues>(key: K, value: MyBudgetFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setError(null); setEditing(null); setErrors({}); }, []);

  const loadFrom = useCallback((b: Budget) => {
    setEditing(b);
    setValues({
      name: b.name,
      period: b.period,
      category: b.category || '',
      notes: b.notes || '',
      lines: b.lineItems && b.lineItems.length > 0
        ? b.lineItems.map((li) => ({ description: li.description, amount: String(li.budgetedAmount) }))
        : [{ description: '', amount: '' }],
    });
    setError(null);
  }, []);

  const addLine = useCallback(() => setValues((prev) => ({ ...prev, lines: [...prev.lines, { description: '', amount: '' }] })), []);
  const removeLine = useCallback((i: number) => setValues((prev) => (prev.lines.length <= 1 ? prev : { ...prev, lines: prev.lines.filter((_, idx) => idx !== i) })), []);
  const updateLine = useCallback((i: number, field: keyof BudgetLineRow, val: string) =>
    setValues((prev) => ({ ...prev, lines: prev.lines.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)) })), []);

  const lineTotal = values.lines.reduce((s, l) => s + (parseFloat(l.amount?.replace(/,/g, '') || '0') || 0), 0);

  const submit = useCallback(async (asDraft: boolean) => {
    setError(null);
    const parsed = createBudgetSchema.safeParse({
      name: values.name,
      period: values.period,
      hasLineDescriptions: values.lines.every((l) => l.description.trim().length > 0),
      hasLineAmount: values.lines.some((l) => parseFloat(l.amount?.replace(/,/g, '') || '0') > 0),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    try {
      const payload: CreateBudgetPayload = {
        name: values.name,
        department: deptName,
        category: values.category || undefined,
        period: values.period,
        notes: values.notes || undefined,
        lineItems: values.lines.map((l) => ({
          description: l.description,
          category: values.category || undefined,
          budgetedAmount: parseFloat(l.amount?.replace(/,/g, '') || '0') || 0,
        })),
      };

      if (editing) {
        await onUpdate(editing.id, payload);
        if (!asDraft) {
          await onUpdate(editing.id, { status: 'UNDER_REVIEW' });
        }
      } else {
        const created = await onCreate(payload);
        if (!asDraft && created?.id) {
          await onUpdate(created.id, { status: 'UNDER_REVIEW' });
        }
      }
      onSuccess();
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : editing ? 'Failed to update budget.' : 'Failed to create budget.');
    }
  }, [values, deptName, editing, onCreate, onUpdate, onSuccess, reset]);

  return {
    values, setField, editing, errors, error, setError,
    reset, loadFrom, addLine, removeLine, updateLine, lineTotal, submit,
  };
}
