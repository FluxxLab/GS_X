'use client';

import { useState } from 'react';
import type { CreatePettyCashPayload } from '@/lib/types/finance';

interface ExpenseOptions {
  onCreate: (payload: CreatePettyCashPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Record-expense form for petty cash. Preserves the original manual validation
 * (required fields + ₦ 20,000 cap with the exact messages) rather than swapping
 * in zod, to keep behavior byte-for-byte.
 */
export function usePettyCashExpenseForm({ onCreate, onSuccess }: ExpenseOptions) {
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expDate, setExpDate] = useState('');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [expError, setExpError] = useState<string | null>(null);

  const reset = () => {
    setExpDesc('');
    setExpAmount('');
    setExpCategory('');
    setExpPaidTo('');
    setExpDate('');
    setExpError(null);
  };

  const submit = async () => {
    setExpError(null);
    if (!expDesc || !expAmount || !expDate) {
      setExpError('Please fill in all required fields.');
      return;
    }
    if (parseFloat(expAmount) > 20000) {
      setExpError('Petty cash transactions cannot exceed ₦ 20,000. Use the expense module for larger amounts.');
      return;
    }
    await onCreate({
      date: expDate,
      type: 'EXPENSE',
      description: expDesc,
      amount: parseFloat(expAmount),
      category: expCategory || undefined,
      paidTo: expPaidTo || undefined,
      custodian: 'current-user',
    });
    onSuccess();
    reset();
  };

  return {
    expDesc, setExpDesc,
    expAmount, setExpAmount,
    expCategory, setExpCategory,
    expPaidTo, setExpPaidTo,
    expDate, setExpDate,
    catDropdownOpen, setCatDropdownOpen,
    expError, setExpError,
    submit,
  };
}

interface ReplenishOptions {
  onReplenish: (data: { amount: number; custodian: string }) => Promise<unknown>;
  onSuccess: () => void;
}

/** Replenish-float form for petty cash. */
export function usePettyCashReplenishForm({ onReplenish, onSuccess }: ReplenishOptions) {
  const [repAmount, setRepAmount] = useState('');

  const submit = async () => {
    if (!repAmount) return;
    await onReplenish({ amount: parseFloat(repAmount), custodian: 'current-user' });
    onSuccess();
    setRepAmount('');
  };

  return { repAmount, setRepAmount, submit };
}
