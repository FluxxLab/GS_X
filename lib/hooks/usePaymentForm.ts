'use client';

import { useState, useCallback } from 'react';
import type { CreatePaymentPayload, PaymentType, PaymentMethod } from '@/lib/types/finance';
import { createPaymentSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface PaymentFormValues {
  type: PaymentType;
  customer: string;
  invoice: string;
  amount: string;
  method: PaymentMethod | '';
  date: string;
  reference: string;
  notes: string;
  budget: string;
  /** Toggle: allocate one incoming receipt across multiple invoices. */
  allocate: boolean;
  /** invoiceId → amount (as a string, straight from the input). */
  allocations: Record<string, string>;
  /** Record the receipt as an on-account deposit (no invoice, no allocations). */
  onAccount: boolean;
}

const EMPTY: PaymentFormValues = {
  type: 'INCOMING', customer: '', invoice: '', amount: '', method: '',
  date: '', reference: '', notes: '', budget: '',
  allocate: false, allocations: {}, onAccount: false,
};

interface Options {
  onCreate: (payload: CreatePaymentPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Record-payment form: a single values object + zod validation at the boundary + payload build. */
export function usePaymentForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<PaymentFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof PaymentFormValues>(key: K, value: PaymentFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const setAllocation = useCallback(
    (invoiceId: string, amount: string) =>
      setValues((prev) => ({ ...prev, allocations: { ...prev.allocations, [invoiceId]: amount } })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  const submit = useCallback(async () => {
    const parsed = createPaymentSchema.safeParse({
      customerName: values.customer,
      date: values.date,
      method: values.method,
      amount: parseFloat(values.amount),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    // Non-zero allocation entries → the multi-invoice payload.
    const allocationEntries = Object.entries(values.allocations)
      .map(([invoiceId, amt]) => ({ invoiceId, amount: parseFloat(amt) }))
      .filter((a) => a.amount > 0);
    const useAllocations = values.type === 'INCOMING' && values.allocate && allocationEntries.length > 0;

    try {
      const payload: CreatePaymentPayload = {
        date: values.date,
        type: values.type,
        method: values.method as PaymentMethod,
        amount: parseFloat(values.amount),
        customerName: values.customer,
        ...(useAllocations
          ? { allocations: allocationEntries }
          : values.invoice
            ? { invoiceId: values.invoice }
            : values.onAccount
              ? { onAccount: true }
              : {}),
        ...(values.notes ? { description: values.notes } : {}),
      };
      await onCreate(payload);
      onSuccess();
    } catch (err) {
      console.error("Failed to create payment:", err);
    }
  }, [values, onCreate, onSuccess]);

  return { values, setField, setAllocation, errors, reset, submit };
}
