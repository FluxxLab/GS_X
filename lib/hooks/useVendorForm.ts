'use client';

import { useState, useCallback } from 'react';
import type { CreateVendorPayload } from '@/lib/types/finance';
import { createVendorSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface VendorFormValues {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  tin: string;
  bankName: string;
  bankAccNo: string;
  bankAccName: string;
  paymentTerms: string;
  whtCategory: string;
  whtRate: string;
}

const EMPTY: VendorFormValues = {
  name: '', contact: '', email: '', phone: '', address: '', tin: '',
  bankName: '', bankAccNo: '', bankAccName: '', paymentTerms: '30',
  whtCategory: '', whtRate: '5',
};

interface Options {
  onCreate: (payload: CreateVendorPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Owns the create-vendor form: a single values object, zod validation, and the
 * payload-build. The page wires the mutation + a success callback.
 */
export function useVendorForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<VendorFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof VendorFormValues>(key: K, value: VendorFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(EMPTY);
    setErrors({});
  }, []);

  const submit = useCallback(async () => {
    const parsed = createVendorSchema.safeParse({
      name: values.name,
      email: values.email,
      phone: values.phone,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    await onCreate({
      name: values.name,
      contactPerson: values.contact || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      taxId: values.tin || undefined,
      bankName: values.bankName || undefined,
      bankAccountNumber: values.bankAccNo || undefined,
      bankAccountName: values.bankAccName || undefined,
      paymentTermsDays: parseInt(values.paymentTerms) || 30,
      whtCategory: values.whtCategory || undefined,
      defaultWhtRate: parseFloat(values.whtRate) || 5,
    });
    reset();
    onSuccess();
  }, [values, onCreate, onSuccess, reset]);

  return { values, setField, errors, reset, submit };
}
