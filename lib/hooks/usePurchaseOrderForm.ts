'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CreatePurchaseOrderPayload } from '@/lib/types/finance';
import { createPurchaseOrderSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface PurchaseOrderFormValues {
  vendorName: string;
  date: string;
  deliveryDate: string;
  department: string;
  budgetId: string;
  notes: string;
  lineDesc: string;
  lineQty: string;
  linePrice: string;
  requisitionId: string;
  requisitionNumber: string;
}

const EMPTY: PurchaseOrderFormValues = {
  vendorName: '', date: '', deliveryDate: '', department: '', budgetId: '', notes: '',
  lineDesc: '', lineQty: '', linePrice: '', requisitionId: '', requisitionNumber: '',
};

interface Options {
  onCreate: (payload: CreatePurchaseOrderPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create-PO form: values + zod validation at the boundary + payload build. */
export function usePurchaseOrderForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<PurchaseOrderFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof PurchaseOrderFormValues>(key: K, value: PurchaseOrderFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  /** Prefill from a "Convert to PO" requisition deep-link (?fromPR=...). */
  const prefillFromRequisition = useCallback((searchParams: ReturnType<typeof useSearchParams>, fromPR: string) => {
    const amount = searchParams.get('amount');
    const title = searchParams.get('title') || '';
    setValues({
      ...EMPTY,
      requisitionId: fromPR,
      requisitionNumber: searchParams.get('prNumber') || '',
      vendorName: searchParams.get('vendor') || '',
      department: searchParams.get('department') || '',
      date: new Date().toISOString().split('T')[0],
      lineDesc: title || '',
      linePrice: amount && Number(amount) > 0 ? amount : '',
      lineQty: '1',
      notes: `Created from requisition ${searchParams.get('prNumber') || fromPR}`,
    });
    setErrors({});
  }, []);

  const submit = useCallback(async () => {
    const parsed = createPurchaseOrderSchema.safeParse({
      vendorName: values.vendorName,
      date: values.date,
      lineDescription: values.lineDesc,
      lineQuantity: parseFloat(values.lineQty),
      lineUnitPrice: parseFloat(values.linePrice),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const payload: CreatePurchaseOrderPayload = {
      vendorName: values.vendorName,
      date: values.date,
      deliveryDate: values.deliveryDate || undefined,
      department: values.department || undefined,
      budgetId: values.budgetId || undefined,
      notes: values.notes || undefined,
      requisitionId: values.requisitionId || undefined,
      requisitionNumber: values.requisitionNumber || undefined,
      lineItems: [{ description: values.lineDesc, quantity: parseFloat(values.lineQty), unitPrice: parseFloat(values.linePrice) }],
    } as CreatePurchaseOrderPayload;
    try {
      await onCreate(payload);
      onSuccess();
    } catch {
      // error handled by the data hook / react-query
    }
  }, [values, onCreate, onSuccess]);

  return { values, setField, errors, reset, prefillFromRequisition, submit };
}
