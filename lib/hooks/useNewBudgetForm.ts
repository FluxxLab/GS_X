'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { lookupService } from '@/lib/services/lookup.service';
import { departmentService } from '@/lib/services/department.service';
import { useBudgets } from '@/lib/hooks/useBudgets';
import { createBudgetSchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';
import type { CreateBudgetPayload } from '@/lib/types/finance';
import type { Lookup } from '@/lib/types/lookup';

export interface LineItem {
  id: number;
  description: string;
  amount: string;
}

/**
 * Owns the create-budget form: field values, the multi-line allocation list
 * (add/remove/update), the async-loaded dropdown options and the create/submit
 * wiring. "Save as Draft" creates the budget (the backend defaults it to DRAFT);
 * "Submit for Approval" creates it then immediately PATCHes its status to
 * UNDER_REVIEW — matching the existing budget review flow (UNDER_REVIEW →
 * FINANCE_APPROVED → ACTIVE) and the self-service useMyBudgetForm hook. Both
 * flows reuse the shared createBudgetSchema zod gate, then redirect to the
 * budgets list (the mutations invalidate the budgets query on success).
 */
export function useNewBudgetForm() {
  const router = useRouter();
  const { createBudget, updateBudget } = useBudgets();

  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [period, setPeriod] = useState('');
  const [approver, setApprover] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: '', amount: '' },
    { id: 2, description: '', amount: '' },
    { id: 3, description: '', amount: '' },
  ]);

  const [departments, setDepartments] = useState<string[]>([]);
  const [categoryLookups, setCategoryLookups] = useState<Lookup[]>([]);
  const [periodOptions, setPeriodOptions] = useState<string[]>([]);
  const [approverOptions, setApproverOptions] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [depts, cats, periods, approvers] = await Promise.all([
          departmentService.getAll(),
          lookupService.getByCategory('budget_category'),
          lookupService.getByCategory('budget_period'),
          lookupService.getByCategory('budget_approver'),
        ]);
        setDepartments(depts.data?.map((d) => d.name) || []);
        setCategoryLookups(cats);
        setPeriodOptions(periods.filter((p: Lookup) => p.isActive).map((p: Lookup) => p.label));
        setApproverOptions(approvers.filter((a: Lookup) => a.isActive).map((a: Lookup) => a.label));
      } catch {
        // Fallback to empty arrays — form will show empty dropdowns
      } finally {
        setOptionsLoading(false);
      }
    }
    loadOptions();
  }, []);

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { id: Date.now(), description: '', amount: '' }]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLineItem = (id: number, field: 'description' | 'amount', value: string) => {
    setLineItems((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const totalBudget = lineItems.reduce((s, l) => {
    const n = parseFloat(l.amount.replace(/,/g, '')) || 0;
    return s + n;
  }, 0);

  const availableCategories = department
    ? categoryLookups
        .filter((c) => c.isActive && c.metadata?.department === department)
        .map((c) => c.label)
    : [];

  const setDepartmentAndResetCategory = (val: string) => {
    setDepartment(val);
    setCategory('');
  };

  // No dedicated name field on this form — derive a human-readable budget name
  // from the selected department / category / period (matches how the list
  // surfaces Budget.name).
  const derivedName = [department, category].filter(Boolean).join(' - ')
    + (period ? `${department || category ? ' ' : ''}(${period})` : '');

  const submit = useCallback(
    async (asDraft: boolean) => {
      setError(null);
      const parsed = createBudgetSchema.safeParse({
        name: derivedName,
        period,
        hasLineDescriptions: lineItems.every((l) => l.description.trim().length > 0),
        hasLineAmount: lineItems.some((l) => parseFloat(l.amount.replace(/,/g, '') || '0') > 0),
      });
      if (!parsed.success) {
        setErrors(zodFieldErrors(parsed.error));
        return;
      }
      setErrors({});
      setSubmitting(true);

      try {
        const payload: CreateBudgetPayload = {
          name: derivedName,
          department: department || undefined,
          category: category || undefined,
          period,
          notes: notes.trim() || undefined,
          approvedBy: approver || undefined,
          lineItems: lineItems.map((l) => ({
            description: l.description,
            category: category || undefined,
            budgetedAmount: parseFloat(l.amount.replace(/,/g, '') || '0') || 0,
          })),
        };

        const created = await createBudget(payload);
        if (!asDraft && created?.id) {
          await updateBudget(created.id, { status: 'UNDER_REVIEW' });
        }
        router.push('/dashboard/finance/budgets');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create budget.');
        setSubmitting(false);
      }
    },
    [derivedName, period, lineItems, department, category, notes, approver, createBudget, updateBudget, router],
  );

  return {
    department,
    setDepartmentAndResetCategory,
    category,
    setCategory,
    period,
    setPeriod,
    approver,
    setApprover,
    notes,
    setNotes,
    lineItems,
    addLineItem,
    removeLineItem,
    updateLineItem,
    totalBudget,
    availableCategories,
    periodOptions,
    approverOptions,
    departments,
    optionsLoading,
    submit,
    submitting,
    errors,
    error,
  };
}
