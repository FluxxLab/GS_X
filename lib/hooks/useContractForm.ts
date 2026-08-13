'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Budget, ContractType, CreateContractPayload } from '@/lib/types/finance';
import { createContractSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { fmtCurrency } from '@/lib/constants/procurement';

export interface SlaMetricRow { metric: string; target: string; penalty: string }

export interface ContractFormValues {
  title: string;
  contractType: ContractType | '';
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  startDate: string;
  endDate: string;
  contractValue: string;
  paymentTerms: string;
  scopeOfWork: string;
  deliverables: string;
  paymentSchedule: string;
  penaltyClauses: string;
  warrantyTerms: string;
  specialConditions: string;
  budgetId: string;
  notes: string;
  slaMetrics: SlaMetricRow[];
}

const EMPTY: ContractFormValues = {
  title: '', contractType: '', vendorId: '', vendorName: '', vendorEmail: '',
  startDate: '', endDate: '', contractValue: '', paymentTerms: '', scopeOfWork: '',
  deliverables: '', paymentSchedule: '', penaltyClauses: '', warrantyTerms: '',
  specialConditions: '', budgetId: '', notes: '',
  slaMetrics: [{ metric: '', target: '', penalty: '' }],
};

interface Options {
  budgets: Budget[];
  onCreate: (payload: CreateContractPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create-contract form: values, budget validation, zod gate, payload build. */
export function useContractForm({ budgets, onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<ContractFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof ContractFormValues>(key: K, value: ContractFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); setFormError(null); }, []);

  const setSlaMetrics = useCallback((rows: SlaMetricRow[]) => setValues((prev) => ({ ...prev, slaMetrics: rows })), []);

  // Budget validation
  const activeBudgets = useMemo(() => budgets.filter((b) => b.status === 'ACTIVE'), [budgets]);
  const selectedBudget = activeBudgets.find((b) => b.id === values.budgetId);
  const budgetAvailable = selectedBudget ? selectedBudget.totalBudgeted - selectedBudget.totalCommitted - selectedBudget.totalActual : 0;
  const contractValueNum = parseFloat(values.contractValue.replace(/,/g, '') || '0');
  const exceedsBudget = !!values.budgetId && contractValueNum > budgetAvailable;

  const submit = useCallback(async () => {
    setFormError(null);
    const parsed = createContractSchema.safeParse({
      title: values.title,
      contractType: values.contractType,
      vendorName: values.vendorName,
      startDate: values.startDate,
      endDate: values.endDate,
      budgetId: values.budgetId,
      contractValue: parseFloat(values.contractValue.replace(/,/g, '')) || Number.NaN,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    if (exceedsBudget) {
      setFormError(`Contract value (${fmtCurrency(contractValueNum)}) exceeds available budget balance (${fmtCurrency(budgetAvailable)}).`);
      return;
    }
    const payload: CreateContractPayload = {
      title: values.title,
      contractType: values.contractType as ContractType,
      vendorName: values.vendorName,
      vendorEmail: values.vendorEmail || undefined,
      vendorId: values.vendorId || undefined,
      budgetId: values.budgetId || undefined,
      startDate: values.startDate,
      endDate: values.endDate,
      contractValue: parseFloat(values.contractValue.replace(/,/g, '')) || 0,
      paymentTermsDays: values.paymentTerms ? parseInt(values.paymentTerms) : undefined,
      scopeOfWork: values.scopeOfWork || undefined,
      deliverables: values.deliverables || undefined,
      paymentSchedule: values.paymentSchedule || undefined,
      penaltyClauses: values.penaltyClauses || undefined,
      warrantyTerms: values.warrantyTerms || undefined,
      specialConditions: values.specialConditions || undefined,
      notes: values.notes || undefined,
      slaMetrics: values.contractType === 'SLA' ? values.slaMetrics.filter((m) => m.metric) : undefined,
    };
    try {
      await onCreate(payload);
      onSuccess();
    } catch {
      // handled by the data hook / react-query
    }
  }, [values, exceedsBudget, contractValueNum, budgetAvailable, onCreate, onSuccess]);

  return {
    values, setField, setSlaMetrics, errors, formError, reset, submit,
    activeBudgets, selectedBudget, budgetAvailable, contractValueNum, exceedsBudget,
  };
}
