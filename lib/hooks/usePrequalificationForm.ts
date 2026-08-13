'use client';

import { useState, useCallback } from 'react';
import type { CreateVendorPrequalificationPayload } from '@/lib/types/finance';
import { vendorPrequalificationSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface PrequalificationFormValues {
  company: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  rcNumber: string;
  tin: string;
  years: string;
  businessType: string;
  bankName: string;
  bankAccNo: string;
  bankAccName: string;
  services: string;
  turnover: string;
  employees: string;
}

const EMPTY: PrequalificationFormValues = {
  company: '', contact: '', email: '', phone: '', address: '', website: '',
  rcNumber: '', tin: '', years: '', businessType: '', bankName: '', bankAccNo: '',
  bankAccName: '', services: '', turnover: '', employees: '',
};

interface Options {
  onCreate: (payload: CreateVendorPrequalificationPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** New-vendor-prequalification form: values + zod at boundary + payload build. */
export function usePrequalificationForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<PrequalificationFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const setField = useCallback(
    <K extends keyof PrequalificationFormValues>(key: K, value: PrequalificationFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(EMPTY); setErrors({}); setFormError(null); setStep(0);
  }, []);

  const submit = useCallback(async () => {
    setFormError(null);
    const parsed = vendorPrequalificationSchema.safeParse({
      companyName: values.company,
      contactPerson: values.contact,
      email: values.email,
      phone: values.phone,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      setStep(0);
      return;
    }
    setErrors({});
    try {
      await onCreate({
        companyName: values.company,
        contactPerson: values.contact,
        email: values.email,
        phone: values.phone,
        address: values.address || undefined,
        website: values.website || undefined,
        rcNumber: values.rcNumber || undefined,
        taxId: values.tin || undefined,
        yearsInBusiness: values.years ? parseInt(values.years) : undefined,
        businessType: values.businessType || undefined,
        bankName: values.bankName || undefined,
        bankAccountNumber: values.bankAccNo || undefined,
        bankAccountName: values.bankAccName || undefined,
        servicesOffered: values.services || undefined,
        annualTurnover: values.turnover ? parseFloat(values.turnover.replace(/,/g, "")) : undefined,
        numberOfEmployees: values.employees ? parseInt(values.employees) : undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit application.");
    }
  }, [values, onCreate, onSuccess]);

  return { values, setField, errors, formError, setFormError, step, setStep, reset, submit };
}
