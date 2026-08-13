'use client';

import { useState, useCallback } from 'react';
import type {
  AmortizationSchedule,
  AmortizationType,
  CreateAmortizationSchedulePayload,
  UpdateAmortizationSchedulePayload,
} from '@/lib/types/finance';

interface Options {
  onCreate: (payload: CreateAmortizationSchedulePayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateAmortizationSchedulePayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create/edit form for an amortization schedule (prepaid expense / deferred revenue). */
export function useAmortizationForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [editing, setEditing] = useState<AmortizationSchedule | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AmortizationType>('PREPAID_EXPENSE');
  const [plAccountId, setPlAccountId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [periods, setPeriods] = useState('12');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = useCallback(() => {
    setEditing(null);
    setName(''); setType('PREPAID_EXPENSE'); setPlAccountId('');
    setTotalAmount(''); setPeriods('12'); setStartDate(''); setNotes('');
    setErrors({});
  }, []);

  const loadSchedule = useCallback((s: AmortizationSchedule) => {
    setEditing(s);
    setName(s.name);
    setType(s.type);
    setPlAccountId(s.plAccountId);
    setTotalAmount(String(s.totalAmount));
    setPeriods(String(s.periods));
    setStartDate(s.startDate);
    setNotes(s.notes ?? '');
    setErrors({});
  }, []);

  // Once recognition has started the amounts/dates are locked server-side.
  const amountsLocked = !!editing && editing.periodsRecognized > 0;

  const totalNum = parseFloat(totalAmount) || 0;
  const periodsNum = parseInt(periods, 10) || 0;
  const perPeriod = periodsNum > 0 ? totalNum / periodsNum : 0;

  const submit = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Give the schedule a name';
    if (!plAccountId) e.plAccountId = 'Select the P&L account';
    if (totalNum <= 0) e.totalAmount = 'Enter a total amount';
    if (periodsNum < 1) e.periods = 'At least one period';
    if (!startDate) e.startDate = 'Pick a start date';
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});

    try {
      if (editing) {
        const payload: UpdateAmortizationSchedulePayload = { name: name.trim(), plAccountId, notes: notes || undefined };
        if (!amountsLocked) {
          payload.type = type;
          payload.totalAmount = totalNum;
          payload.periods = periodsNum;
          payload.startDate = startDate;
        }
        await onUpdate(editing.id, payload);
      } else {
        await onCreate({ name: name.trim(), type, plAccountId, totalAmount: totalNum, periods: periodsNum, startDate, notes: notes || undefined });
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save amortization schedule:', err);
    }
  }, [name, type, plAccountId, totalNum, periodsNum, startDate, notes, editing, amountsLocked, onCreate, onUpdate, onSuccess]);

  return {
    editing,
    name, setName,
    type, setType,
    plAccountId, setPlAccountId,
    totalAmount, setTotalAmount,
    periods, setPeriods,
    startDate, setStartDate,
    notes, setNotes,
    perPeriod,
    amountsLocked,
    errors,
    reset, loadSchedule, submit,
  };
}
