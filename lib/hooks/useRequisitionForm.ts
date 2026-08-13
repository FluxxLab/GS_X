'use client';

import { useState, useCallback } from 'react';
import type { CreatePRPayload } from '@/lib/types/finance';
import { createPurchaseRequisitionSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface RequisitionLineRow { description: string; unit: string; quantity: string; estimatedUnitPrice: string }

export interface RequisitionFormValues {
  title: string;
  description: string;
  requiredDate: string;
  budgetId: string;
  justification: string;
  notes: string;
  lineItems: RequisitionLineRow[];
}

const EMPTY: RequisitionFormValues = {
  title: '', description: '', requiredDate: '', budgetId: '', justification: '', notes: '',
  lineItems: [{ description: '', unit: '', quantity: '', estimatedUnitPrice: '' }],
};

interface Options {
  onCreate: (payload: CreatePRPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create-purchase-requisition form: values, line items, zod gate, payload build. */
export function useRequisitionForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<RequisitionFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof RequisitionFormValues>(key: K, value: RequisitionFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  const addLineItem = useCallback(() => setValues((prev) => ({ ...prev, lineItems: [...prev.lineItems, { description: '', unit: '', quantity: '', estimatedUnitPrice: '' }] })), []);
  const removeLineItem = useCallback((idx: number) => setValues((prev) => (prev.lineItems.length <= 1 ? prev : { ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) })), []);
  const updateLineItem = useCallback((idx: number, field: keyof RequisitionLineRow, value: string) => setValues((prev) => {
    const lineItems = [...prev.lineItems];
    lineItems[idx] = { ...lineItems[idx], [field]: value };
    return { ...prev, lineItems };
  }), []);

  const lineTotal = values.lineItems.reduce((sum, li) => {
    const qty = parseFloat(li.quantity) || 0;
    const price = parseFloat(li.estimatedUnitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const submit = useCallback(async () => {
    const parsed = createPurchaseRequisitionSchema.safeParse({
      title: values.title,
      hasLineItem: values.lineItems.some((li) => li.description.trim() !== ''),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const payload: CreatePRPayload = {
      title: values.title,
      description: values.description || undefined,
      requestDate: new Date().toISOString().split('T')[0],
      requiredDate: values.requiredDate || undefined,
      budgetId: values.budgetId || undefined,
      justification: values.justification || undefined,
      notes: values.notes || undefined,
      lineItems: values.lineItems
        .filter((li) => li.description)
        .map((li) => ({
          description: li.description,
          unit: li.unit || undefined,
          quantity: parseFloat(li.quantity) || 1,
          estimatedUnitPrice: parseFloat(li.estimatedUnitPrice) || 0,
        })),
    };
    try {
      await onCreate(payload);
      onSuccess();
    } catch {
      // handled
    }
  }, [values, onCreate, onSuccess]);

  return { values, setField, addLineItem, removeLineItem, updateLineItem, lineTotal, errors, reset, submit };
}
