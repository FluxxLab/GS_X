'use client';

import { useState, useCallback } from 'react';
import type { Customer, CreateCustomerPayload } from '@/lib/types/finance';
import { createCustomerSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface CustomerFormValues {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  lga: string;
  paymentTerms: string;
  notes: string;
}

const EMPTY: CustomerFormValues = {
  name: '', contact: '', email: '', phone: '', address: '',
  state: '', lga: '', paymentTerms: '30', notes: '',
};

interface Options {
  onCreate: (payload: CreateCustomerPayload) => Promise<unknown>;
  onUpdate: (id: string, payload: CreateCustomerPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Owns the create/edit customer form: a single values object (not 10 useStates),
 * zod validation at the boundary, edit-prefill, and submit. The page just wires
 * the data mutations and a success callback.
 */
export function useCustomerForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [values, setValues] = useState<CustomerFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Customer | null>(null);

  const setField = useCallback(
    <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(EMPTY);
    setEditing(null);
    setErrors({});
  }, []);

  const loadForEdit = useCallback((c: Customer) => {
    const parts = (c.region || '').split(', ');
    setEditing(c);
    setValues({
      name: c.name,
      contact: c.contactPerson || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      state: parts[0] || '',
      lga: parts[1] || '',
      paymentTerms: String(c.paymentTermsDays || 30),
      notes: c.notes || '',
    });
    setErrors({});
  }, []);

  const submit = useCallback(async () => {
    const parsed = createCustomerSchema.safeParse({
      name: values.name,
      email: values.email,
      phone: values.phone,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const payload: CreateCustomerPayload = {
      name: values.name,
      contactPerson: values.contact || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      region: values.state ? `${values.state}${values.lga ? `, ${values.lga}` : ''}` : undefined,
      paymentTermsDays: parseInt(values.paymentTerms) || 30,
      notes: values.notes || undefined,
    };
    if (editing) await onUpdate(editing.id, payload);
    else await onCreate(payload);
    reset();
    onSuccess();
  }, [values, editing, onCreate, onUpdate, onSuccess, reset]);

  return { values, setField, errors, editing, loadForEdit, reset, submit };
}
