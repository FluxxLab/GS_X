'use client';

import { useState, useCallback } from 'react';
import type { CreateRfqPayload, PurchaseRequisition, Rfq } from '@/lib/types/finance';
import { financeService } from '@/lib/services/finance.service';
import { createRfqSchema } from '@/lib/validation/operations';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface RfqItemRow { description: string; unit: string; quantity: string; specifications: string }

export interface RfqFormValues {
  title: string;
  description: string;
  requisitionId: string;
  issueDate: string;
  closingDate: string;
  terms: string;
  notes: string;
  vendorIds: string[];
  items: RfqItemRow[];
}

const EMPTY: RfqFormValues = {
  title: '', description: '', requisitionId: '', issueDate: '', closingDate: '',
  terms: '', notes: '', vendorIds: [],
  items: [{ description: '', unit: '', quantity: '', specifications: '' }],
};

interface Options {
  prList: PurchaseRequisition[];
  onCreate: (payload: CreateRfqPayload) => Promise<unknown>;
  onUpdate: (id: string, payload: Partial<CreateRfqPayload>) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create/edit-RFQ form: values, items, invited vendors, zod gate, payload build. */
export function useRfqForm({ prList, onCreate, onUpdate, onSuccess }: Options) {
  const [values, setValues] = useState<RfqFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingRfq, setEditingRfq] = useState<Rfq | null>(null);

  const setField = useCallback(
    <K extends keyof RfqFormValues>(key: K, value: RfqFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); setEditingRfq(null); }, []);

  const setItems = useCallback((items: RfqItemRow[]) => setValues((prev) => ({ ...prev, items })), []);
  const addItem = useCallback(() => setValues((prev) => ({ ...prev, items: [...prev.items, { description: '', unit: '', quantity: '', specifications: '' }] })), []);
  const removeItem = useCallback((idx: number) => setValues((prev) => (prev.items.length <= 1 ? prev : { ...prev, items: prev.items.filter((_, i) => i !== idx) })), []);
  const updateItem = useCallback((idx: number, field: keyof RfqItemRow, value: string) => setValues((prev) => {
    const items = [...prev.items];
    items[idx] = { ...items[idx], [field]: value };
    return { ...prev, items };
  }), []);

  const toggleVendor = useCallback((vendorId: string) => setValues((prev) => ({
    ...prev,
    vendorIds: prev.vendorIds.includes(vendorId) ? prev.vendorIds.filter((v) => v !== vendorId) : [...prev.vendorIds, vendorId],
  })), []);

  const loadForEdit = useCallback((rfq: Rfq) => {
    setEditingRfq(rfq);
    setValues({
      title: rfq.title || '',
      description: rfq.description || '',
      requisitionId: rfq.requisitionId || '',
      issueDate: rfq.issueDate || '',
      closingDate: rfq.closingDate || '',
      terms: rfq.terms || '',
      notes: rfq.notes || '',
      vendorIds: rfq.invitedVendorIds || [],
      items: rfq.items && rfq.items.length > 0
        ? rfq.items.map((it) => ({ description: it.description || '', unit: it.unit || '', quantity: String(it.quantity || ''), specifications: it.specifications || '' }))
        : [{ description: '', unit: '', quantity: '', specifications: '' }],
    });
    setErrors({});
  }, []);

  /** Prefill the create form from a requisition (the `?fromPR=` deep-link flow). */
  const prefillFromPR = useCallback(async (prId: string, prNumber: string, title: string): Promise<void> => {
    setEditingRfq(null);
    setErrors({});
    const issue = new Date().toISOString().split('T')[0];
    const closing = new Date();
    closing.setDate(closing.getDate() + 14);
    const closingStr = closing.toISOString().split('T')[0];
    try {
      const pr = await financeService.getPurchaseRequisition(prId);
      // `purpose` is not on the PurchaseRequisition type but the API/original read it; preserve that fallback.
      const purpose = (pr as { purpose?: string }).purpose;
      setValues({
        ...EMPTY,
        requisitionId: prId,
        issueDate: issue,
        closingDate: closingStr,
        notes: `Linked to requisition ${prNumber}`,
        title: pr.title || title || `RFQ for ${prNumber}`,
        description: purpose || pr.description || `Request for Quotation from requisition ${prNumber}`,
        items: pr.lineItems && pr.lineItems.length > 0
          ? pr.lineItems.map((li) => ({
              description: li.description || '',
              unit: li.unit || 'units',
              quantity: String(li.quantity || 1),
              specifications: li.specifications || '',
            }))
          : [{ description: title, unit: 'units', quantity: '1', specifications: '' }],
      });
    } catch {
      // Fallback if fetch fails — use URL params
      setValues({
        ...EMPTY,
        requisitionId: prId,
        issueDate: issue,
        closingDate: closingStr,
        notes: `Linked to requisition ${prNumber}`,
        title: title || `RFQ for ${prNumber}`,
        items: [{ description: title, unit: 'units', quantity: '1', specifications: '' }],
      });
    }
  }, []);

  const submit = useCallback(async () => {
    const parsed = createRfqSchema.safeParse({
      title: values.title,
      issueDate: values.issueDate,
      closingDate: values.closingDate,
      hasItem: values.items.some((it) => it.description.trim()),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const selectedPR = prList.find((p) => p.id === values.requisitionId);
    const payload: CreateRfqPayload = {
      title: values.title,
      description: values.description || undefined,
      requisitionId: values.requisitionId || undefined,
      prNumber: selectedPR?.prNumber || editingRfq?.prNumber || undefined,
      issueDate: values.issueDate,
      closingDate: values.closingDate,
      invitedVendorIds: values.vendorIds.length > 0 ? values.vendorIds : undefined,
      terms: values.terms || undefined,
      notes: values.notes || undefined,
      items: values.items
        .filter((it) => it.description)
        .map((it) => ({
          description: it.description,
          unit: it.unit || undefined,
          quantity: parseFloat(it.quantity) || 1,
          specifications: it.specifications || undefined,
        })),
    };
    try {
      if (editingRfq) {
        await onUpdate(editingRfq.id, payload);
      } else {
        await onCreate(payload);
      }
      onSuccess();
    } catch {
      // handled
    }
  }, [values, prList, editingRfq, onCreate, onUpdate, onSuccess]);

  return {
    values, setField, setItems, addItem, removeItem, updateItem, toggleVendor,
    errors, editingRfq, loadForEdit, prefillFromPR, reset, submit,
  };
}
