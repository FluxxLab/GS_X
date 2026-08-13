'use client';

import { useState, useCallback } from 'react';
import type { CreateExpensePayload } from '@/lib/types/finance';
import { createExpenseSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { CATEGORY_TO_API, type DisplayCategory } from '@/lib/constants/expense';

export interface ExpenseFormValues {
  date: string;
  category: DisplayCategory | '';
  vendor: string;
  description: string;
  amount: string;
  notes: string;
  budgetId: string;
  costCenterId: string;
}

const EMPTY: ExpenseFormValues = {
  date: '', category: '', vendor: '', description: '', amount: '', notes: '', budgetId: '', costCenterId: '',
};

interface Options {
  onCreate: (payload: CreateExpensePayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create-expense form: values + zod validation at the boundary + payload build. */
export function useExpenseForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<ExpenseFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  const submit = useCallback(async () => {
    const parsed = createExpenseSchema.safeParse({
      date: values.date,
      category: values.category,
      vendorName: values.vendor,
      description: values.description,
      amount: parseFloat(values.amount),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const payload: CreateExpensePayload = {
      date: values.date,
      category: CATEGORY_TO_API[values.category as DisplayCategory],
      vendorName: values.vendor,
      description: values.description,
      amount: parseFloat(values.amount),
      budgetId: values.budgetId || undefined,
      costCenterId: values.costCenterId || undefined,
    };
    try {
      await onCreate(payload);
      onSuccess();
    } catch {
      // error handled by the data hook / react-query
    }
  }, [values, onCreate, onSuccess]);

  return { values, setField, errors, reset, submit };
}
