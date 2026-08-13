'use client';

import { useState, useCallback, useMemo } from 'react';
import type { CreatePVPayload, PurchaseOrder, Grn } from '@/lib/types/finance';
import { createPaymentVoucherSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface PVFormValues {
  date: string;
  dueDate: string;
  vendorId: string;
  payeeName: string;
  poId: string;
  grnId: string;
  contractRef: string;
  invoiceNo: string;
  grossAmount: string;
  whtRate: string;
  vatAmount: string;
  paymentMethod: string;
  description: string;
  notes: string;
}

const EMPTY: PVFormValues = {
  date: '', dueDate: '', vendorId: '', payeeName: '', poId: '', grnId: '', contractRef: '',
  invoiceNo: '', grossAmount: '', whtRate: '', vatAmount: '', paymentMethod: '',
  description: '', notes: '',
};

interface Options {
  onCreate: (payload: CreatePVPayload) => Promise<unknown>;
  onSuccess: () => void;
  purchaseOrders: PurchaseOrder[];
  /** Lazy getter — resolves the current GRN list at submit time (the list is
   *  filtered by the selected PO, which this very form owns, so it can't be a
   *  plain prop without a render cycle). */
  getGrns: () => Grn[];
}

/**
 * Create-payment-voucher form: a single values object (not 13 useStates),
 * zod validation at the boundary, auto-calculated WHT/Net amounts, and payload build.
 */
export function usePaymentVoucherForm({ onCreate, onSuccess, purchaseOrders, getGrns }: Options) {
  const [values, setValues] = useState<PVFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof PVFormValues>(key: K, value: PVFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  // Auto-calculate (mirrors the original page math).
  const grossNum = parseFloat(values.grossAmount) || 0;
  const whtRateNum = parseFloat(values.whtRate) || 0;
  const vatNum = parseFloat(values.vatAmount) || 0;
  const whtAmount = useMemo(() => grossNum * (whtRateNum / 100), [grossNum, whtRateNum]);
  const netAmount = useMemo(() => grossNum - whtAmount + vatNum, [grossNum, whtAmount, vatNum]);

  const submit = useCallback(async () => {
    const parsed = createPaymentVoucherSchema.safeParse({
      voucherDate: values.date,
      payeeName: values.payeeName,
      description: values.description,
      grossAmount: grossNum,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const po = purchaseOrders.find((p) => p.id === values.poId);
    const grn = getGrns().find((g) => g.id === values.grnId);
    const payload: CreatePVPayload = {
      voucherDate: values.date,
      dueDate: values.dueDate || undefined,
      payeeName: values.payeeName,
      vendorId: values.vendorId || undefined,
      purchaseOrderId: values.poId || undefined,
      poNumber: po?.poNumber || undefined,
      grnId: values.grnId || undefined,
      grnNumber: grn?.grnNumber || undefined,
      contractNumber: values.contractRef || undefined,
      vendorInvoiceNumber: values.invoiceNo || undefined,
      grossAmount: grossNum,
      whtRate: whtRateNum || undefined,
      vatAmount: vatNum || undefined,
      paymentMethod: values.paymentMethod || undefined,
      description: values.description,
      notes: values.notes || undefined,
    };
    try {
      await onCreate(payload);
      onSuccess();
      reset();
    } catch { /* handled */ }
  }, [values, grossNum, whtRateNum, vatNum, purchaseOrders, getGrns, onCreate, onSuccess, reset]);

  return { values, setField, errors, reset, submit, whtAmount, netAmount };
}
