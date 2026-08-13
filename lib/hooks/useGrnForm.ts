'use client';

import { useState, useCallback } from 'react';
import type { CreateGrnPayload, PurchaseOrder } from '@/lib/types/finance';
import { createGrnSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface GrnLineItemValue {
  description: string;
  itemType: "" | "PRODUCT" | "RAW_MATERIAL" | "STORE_ITEM";
  itemId: string;
  unitCost: string;
  orderedQuantity: string;
  receivedQuantity: string;
  rejectedQuantity: string;
  condition: string;
}

export interface GrnFormValues {
  poId: string;
  receivedDate: string;
  receivedBy: string;
  inspectedBy: string;
  deliveryNoteRef: string;
  waybillNumber: string;
  remarks: string;
  landedCost: string;
  lineItems: GrnLineItemValue[];
}

const emptyLineItem = (): GrnLineItemValue => ({
  description: '', itemType: '', itemId: '', unitCost: '', orderedQuantity: '', receivedQuantity: '', rejectedQuantity: '0', condition: 'Good',
});

const EMPTY: GrnFormValues = {
  poId: '', receivedDate: '', receivedBy: '', inspectedBy: '',
  deliveryNoteRef: '', waybillNumber: '', remarks: '', landedCost: '',
  lineItems: [emptyLineItem()],
};

interface Options {
  availablePOs: PurchaseOrder[];
  onCreate: (payload: CreateGrnPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create-GRN form: values (incl. line items) + zod at the boundary + payload build. */
export function useGrnForm({ availablePOs, onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<GrnFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof GrnFormValues>(key: K, value: GrnFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const addLineItem = useCallback(() => {
    setValues((prev) => ({ ...prev, lineItems: [...prev.lineItems, emptyLineItem()] }));
  }, []);

  const removeLineItem = useCallback((index: number) => {
    setValues((prev) => ({ ...prev, lineItems: prev.lineItems.filter((_, j) => j !== index) }));
  }, []);

  const setLineItemField = useCallback(<K extends keyof GrnLineItemValue>(index: number, key: K, value: GrnLineItemValue[K]) => {
    setValues((prev) => {
      const lineItems = prev.lineItems.map((li, j) => (j === index ? { ...li, [key]: value } : li));
      return { ...prev, lineItems };
    });
  }, []);

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  const submit = useCallback(async () => {
    const parsed = createGrnSchema.safeParse({
      purchaseOrderId: values.poId,
      receivedDate: values.receivedDate,
      receivedBy: values.receivedBy,
      hasLineItem: values.lineItems.some((li) => li.description.trim()),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const po = availablePOs.find((p) => p.id === values.poId);
    if (!po) return;
    const payload: CreateGrnPayload = {
      purchaseOrderId: values.poId,
      poNumber: po.poNumber,
      vendorName: po.vendorName,
      vendorId: po.vendorId || undefined,
      receivedDate: values.receivedDate,
      receivedBy: values.receivedBy,
      inspectedBy: values.inspectedBy || undefined,
      deliveryNoteRef: values.deliveryNoteRef || undefined,
      waybillNumber: values.waybillNumber || undefined,
      remarks: values.remarks || undefined,
      landedCost: values.landedCost ? Number(values.landedCost) : undefined,
      lineItems: values.lineItems.map((li) => ({
        description: li.description,
        ...(li.itemType && li.itemId ? { itemType: li.itemType, itemId: li.itemId } : {}),
        ...(li.unitCost ? { unitCost: parseFloat(li.unitCost) || 0 } : {}),
        orderedQuantity: parseFloat(li.orderedQuantity) || 0,
        receivedQuantity: parseFloat(li.receivedQuantity) || 0,
        rejectedQuantity: parseFloat(li.rejectedQuantity) || 0,
        condition: li.condition,
      })),
    };
    try {
      await onCreate(payload);
      onSuccess();
    } catch {
      // handled by react-query
    }
  }, [values, availablePOs, onCreate, onSuccess]);

  return { values, setField, errors, addLineItem, removeLineItem, setLineItemField, reset, submit };
}
