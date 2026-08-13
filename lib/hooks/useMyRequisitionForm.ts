'use client';

import { useState, useCallback } from 'react';
import type { CreatePRPayload, PurchaseRequisition } from '@/lib/types/finance';
import { purchaseRequisitionSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

const fmtIsoDate = (d?: string | null) => (d ? d.split('T')[0] : '');

export interface RequisitionLineRow { description: string; unit: string; qty: string; price: string }

export interface MyRequisitionFormValues {
  title: string;
  description: string;
  requiredDate: string;
  budgetId: string;
  justification: string;
  lines: RequisitionLineRow[];
}

const EMPTY: MyRequisitionFormValues = {
  title: '', description: '', requiredDate: '', budgetId: '', justification: '',
  lines: [{ description: '', unit: 'pcs', qty: '1', price: '' }],
};

interface Options {
  deptName: string;
  departmentId?: string | null;
  onCreate: (payload: CreatePRPayload) => Promise<PurchaseRequisition>;
  onUpdate: (id: string, payload: Partial<CreatePRPayload>) => Promise<PurchaseRequisition>;
  onSubmitPR: (id: string) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Create-purchase-requisition form (employee self-service): single values object
 * with the multi-line item list, zod gate (reusing the shared
 * purchaseRequisitionSchema), and payload build. Mirrors the original page's
 * handleSubmit byte-for-byte, including create-then-submit.
 */
export function useMyRequisitionForm({ deptName, departmentId, onCreate, onUpdate, onSubmitPR, onSuccess }: Options) {
  const [values, setValues] = useState<MyRequisitionFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof MyRequisitionFormValues>(key: K, value: MyRequisitionFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setError(null); setErrors({}); setEditingId(null); }, []);

  const loadForEdit = useCallback((pr: PurchaseRequisition) => {
    setError(null);
    setErrors({});
    setEditingId(pr.id);
    setValues({
      title: pr.title ?? '',
      description: pr.description ?? '',
      requiredDate: fmtIsoDate(pr.requiredDate),
      budgetId: pr.budgetId ?? '',
      justification: pr.justification ?? '',
      lines: pr.lineItems.length
        ? pr.lineItems.map((l) => ({
            description: l.description ?? '',
            unit: l.unit ?? 'pcs',
            qty: String(l.quantity ?? 1),
            price: l.estimatedUnitPrice != null ? String(l.estimatedUnitPrice) : '',
          }))
        : EMPTY.lines,
    });
  }, []);

  const addLine = useCallback(() => setValues((prev) => ({ ...prev, lines: [...prev.lines, { description: '', unit: 'pcs', qty: '1', price: '' }] })), []);
  const removeLine = useCallback((i: number) => setValues((prev) => (prev.lines.length <= 1 ? prev : { ...prev, lines: prev.lines.filter((_, idx) => idx !== i) })), []);
  const updateLine = useCallback((i: number, field: keyof RequisitionLineRow, val: string) =>
    setValues((prev) => ({ ...prev, lines: prev.lines.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)) })), []);

  const lineTotal = values.lines.reduce((s, l) => s + (parseFloat(l.qty || '0') * parseFloat(l.price?.replace(/,/g, '') || '0')), 0);

  const submit = useCallback(async (asDraft: boolean) => {
    setError(null);
    const parsed = purchaseRequisitionSchema.safeParse({
      title: values.title,
      budgetId: values.budgetId,
      hasLineItem: values.lines.some((l) => l.description.trim() !== ''),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    const payload = {
      title: values.title,
      description: values.description || undefined,
      department: deptName || undefined,
      departmentId: departmentId || undefined,
      requiredDate: values.requiredDate || undefined,
      budgetId: values.budgetId || undefined,
      justification: values.justification || undefined,
      lineItems: values.lines.filter((l) => l.description.trim()).map((l) => ({
        description: l.description,
        unit: l.unit || undefined,
        quantity: parseFloat(l.qty) || 1,
        estimatedUnitPrice: parseFloat(l.price?.replace(/,/g, '') || '0') || 0,
      })),
    };

    try {
      const pr = editingId
        ? await onUpdate(editingId, payload)
        : await onCreate({ ...payload, requestDate: new Date().toISOString().split('T')[0] });
      if (!asDraft && pr?.id) {
        await onSubmitPR(pr.id);
      }
      onSuccess();
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${editingId ? 'update' : 'create'} requisition.`);
    }
  }, [values, deptName, departmentId, editingId, onCreate, onUpdate, onSubmitPR, onSuccess, reset]);

  return { values, setField, errors, error, setError, reset, addLine, removeLine, updateLine, lineTotal, submit, loadForEdit, editingId };
}
