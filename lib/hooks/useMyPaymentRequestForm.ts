'use client';

import { useState, useCallback } from 'react';
import type { CreatePVPayload, PaymentVoucher } from '@/lib/types/finance';
import { createPaymentRequestSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface MyPaymentRequestFormValues {
  paymentType: 'DIRECT' | 'PO_BASED';
  date: string;
  vendor: string;
  vendorId: string;
  poId: string;
  poNumber: string;
  grnId: string;
  grnNumber: string;
  invoiceNo: string;
  grossAmount: string;
  whtRate: string;
  vatAmount: string;
  method: string;
  description: string;
  notes: string;
  budgetId: string;
  attachments: File[];
}

const EMPTY: MyPaymentRequestFormValues = {
  paymentType: 'DIRECT', date: '', vendor: '', vendorId: '', poId: '', poNumber: '',
  grnId: '', grnNumber: '', invoiceNo: '', grossAmount: '', whtRate: '5', vatAmount: '',
  method: '', description: '', notes: '', budgetId: '', attachments: [],
};

interface Options {
  onCreate: (payload: CreatePVPayload) => Promise<PaymentVoucher>;
  onUpdate: (id: string, payload: Partial<CreatePVPayload>) => Promise<PaymentVoucher>;
  onSubmitVoucher: (id: string) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Create-payment-request form (employee self-service): single values object,
 * derived amounts (WHT/VAT/Net), zod gate at the boundary (reusing the shared
 * createPaymentRequestSchema), and payload build. Mirrors the original page's
 * handleSubmit byte-for-byte (including the gross→NaN trick when empty).
 */
export function useMyPaymentRequestForm({ onCreate, onUpdate, onSubmitVoucher, onSuccess }: Options) {
  const [values, setValues] = useState<MyPaymentRequestFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof MyPaymentRequestFormValues>(key: K, value: MyPaymentRequestFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setError(null); setErrors({}); setEditingId(null); }, []);

  const loadForEdit = useCallback((pv: PaymentVoucher) => {
    setError(null);
    setErrors({});
    setEditingId(pv.id);
    setValues({
      paymentType: pv.purchaseOrderId ? 'PO_BASED' : 'DIRECT',
      date: pv.voucherDate ? pv.voucherDate.split('T')[0] : '',
      vendor: pv.payeeName ?? '',
      vendorId: pv.vendorId ?? '',
      poId: pv.purchaseOrderId ?? '',
      poNumber: pv.poNumber ?? '',
      grnId: pv.grnId ?? '',
      grnNumber: pv.grnNumber ?? '',
      invoiceNo: pv.vendorInvoiceNumber ?? '',
      grossAmount: pv.grossAmount != null ? String(pv.grossAmount) : '',
      whtRate: pv.whtRate != null ? String(pv.whtRate) : '5',
      vatAmount: pv.vatAmount != null ? String(pv.vatAmount) : '',
      method: pv.paymentMethod ?? '',
      description: pv.description ?? '',
      notes: pv.notes ?? '',
      budgetId: '',
      attachments: [],
    });
  }, []);

  const gross = parseFloat(values.grossAmount?.replace(/,/g, '') || '0');
  const whtAmt = (gross * parseFloat(values.whtRate || '0')) / 100;
  const vat = parseFloat(values.vatAmount?.replace(/,/g, '') || '0');
  const netAmount = gross - whtAmt + vat;

  const submit = useCallback(async (asDraft: boolean) => {
    setError(null);
    const parsed = createPaymentRequestSchema.safeParse({
      paymentType: values.paymentType === 'DIRECT' ? 'DIRECT_PURCHASE' : 'PO_BASED',
      date: values.date,
      payeeName: values.vendor,
      invoiceNumber: values.invoiceNo,
      description: values.description,
      grossAmount: values.grossAmount ? gross : Number.NaN,
      purchaseOrderId: values.poId || undefined,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    const payload: CreatePVPayload = {
      voucherDate: values.date,
      payeeName: values.vendor,
      vendorId: values.vendorId || undefined,
      ...(values.paymentType === 'PO_BASED' ? {
        purchaseOrderId: values.poId || undefined,
        poNumber: values.poNumber || undefined,
        grnId: values.grnId || undefined,
        grnNumber: values.grnNumber || undefined,
      } : {}),
      vendorInvoiceNumber: values.invoiceNo || undefined,
      grossAmount: gross,
      whtRate: parseFloat(values.whtRate || '0'),
      vatAmount: vat,
      paymentMethod: values.method || undefined,
      paymentType: values.paymentType === 'DIRECT' ? 'DIRECT_PURCHASE' : 'PO_BASED',
      description: values.description,
      notes: values.notes || undefined,
    };

    try {
      const pv = editingId ? await onUpdate(editingId, payload) : await onCreate(payload);
      if (!asDraft && pv?.id) {
        await onSubmitVoucher(pv.id);
      }
      onSuccess();
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${editingId ? 'update' : 'create'} payment request.`);
    }
  }, [values, gross, vat, editingId, onCreate, onUpdate, onSubmitVoucher, onSuccess, reset]);

  return { values, setField, errors, error, setError, reset, submit, gross, whtAmt, vat, netAmount, loadForEdit, editingId };
}
