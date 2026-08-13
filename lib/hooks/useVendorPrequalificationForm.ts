'use client';

import { useCallback, useState } from 'react';
import { financeService } from '@/lib/services/finance.service';
import { vendorPrequalificationSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { VPQ_STEPS } from '@/lib/constants/vendor-prequalification-public';

export interface VendorPrequalificationValues {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  rcNumber: string;
  taxId: string;
  yearsInBusiness: string;
  businessType: string;
  services: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  annualTurnover: string;
  numberOfEmployees: string;
}

const INITIAL: VendorPrequalificationValues = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  rcNumber: '',
  taxId: '',
  yearsInBusiness: '',
  businessType: '',
  services: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountName: '',
  annualTurnover: '',
  numberOfEmployees: '',
};

/**
 * Owns the public vendor-prequalification multi-step form: a single values
 * object (not a useState per field), step navigation, the zod gate on step 0
 * (reusing `vendorPrequalificationSchema`, §6), and submit. Mirrors the
 * original page's behavior exactly.
 */
export function useVendorPrequalificationForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appCode, setAppCode] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<VendorPrequalificationValues>(INITIAL);

  const setField = useCallback(
    (field: keyof VendorPrequalificationValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  /** Annual turnover keeps only digits (the field renders a localized string). */
  const setAnnualTurnover = useCallback((rawInput: string) => {
    const raw = rawInput.replace(/,/g, '');
    if (raw === '' || !isNaN(Number(raw))) {
      setValues((prev) => ({ ...prev, annualTurnover: raw }));
    }
  }, []);

  const handleNext = useCallback(() => {
    if (step === 0) {
      const parsed = vendorPrequalificationSchema.safeParse({
        companyName: values.companyName,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
      });
      if (!parsed.success) {
        setFieldErrors(zodFieldErrors(parsed.error));
        return;
      }
      setFieldErrors({});
    }
    setError('');
    setStep((s) => s + 1);
  }, [step, values.companyName, values.contactPerson, values.email, values.phone]);

  const handleBack = useCallback(() => {
    setStep((s) => s - 1);
    setError('');
  }, []);

  const clearError = useCallback(() => setError(''), []);

  const handleSubmit = useCallback(async () => {
    setError('');
    setSubmitting(true);
    try {
      const result = await financeService.submitPublicPrequalification({
        companyName: values.companyName,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        address: values.address || undefined,
        website: values.website || undefined,
        rcNumber: values.rcNumber || undefined,
        taxId: values.taxId || undefined,
        yearsInBusiness: values.yearsInBusiness ? parseInt(values.yearsInBusiness) : undefined,
        businessType: values.businessType || undefined,
        servicesOffered: values.services || undefined,
        bankName: values.bankName || undefined,
        bankAccountNumber: values.bankAccountNumber || undefined,
        bankAccountName: values.bankAccountName || undefined,
        annualTurnover: values.annualTurnover ? parseFloat(values.annualTurnover.replace(/,/g, '')) : undefined,
        numberOfEmployees: values.numberOfEmployees ? parseInt(values.numberOfEmployees) : undefined,
      });
      setAppCode(result.applicationCode);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [values]);

  const isLastStep = step === VPQ_STEPS.length - 1;

  return {
    step,
    isLastStep,
    submitting,
    success,
    appCode,
    error,
    fieldErrors,
    values,
    setField,
    setAnnualTurnover,
    handleNext,
    handleBack,
    handleSubmit,
    clearError,
  };
}
