'use client';

import { useState, useCallback } from 'react';
import type {
  RecurringInvoice,
  RecurringFrequency,
  CreateRecurringInvoicePayload,
  UpdateRecurringInvoicePayload,
} from '@/lib/types/finance';

export interface RILineValue {
  description: string;
  qty: number;
  rate: number;
}

const emptyLine = (): RILineValue => ({ description: '', qty: 1, rate: 0 });
const DEFAULT_TAX = 7.5; // VAT %

interface Options {
  onCreate: (payload: CreateRecurringInvoicePayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateRecurringInvoicePayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create/edit form for a recurring-invoice template + schedule. */
export function useRecurringInvoiceForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [editing, setEditing] = useState<RecurringInvoice | null>(null);
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dueDays, setDueDays] = useState('30');
  const [autoSend, setAutoSend] = useState(false);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX);
  const [lines, setLines] = useState<RILineValue[]>([emptyLine()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = useCallback(() => {
    setEditing(null);
    setName(''); setCustomerId(''); setFrequency('MONTHLY');
    setStartDate(''); setEndDate(''); setDueDays('30'); setAutoSend(false);
    setNotes(''); setTaxRate(DEFAULT_TAX); setLines([emptyLine()]); setErrors({});
  }, []);

  const loadRecurringInvoice = useCallback((ri: RecurringInvoice) => {
    setEditing(ri);
    setName(ri.name);
    setCustomerId(ri.customerId ?? '');
    setFrequency(ri.frequency);
    setStartDate(ri.startDate);
    setEndDate(ri.endDate ?? '');
    setDueDays(String(ri.dueDays));
    setAutoSend(ri.autoSend);
    setNotes(ri.notes ?? '');
    setTaxRate(Number(ri.taxRate) || 0);
    setLines(
      ri.lineItems?.length
        ? ri.lineItems.map((li) => ({ description: li.description, qty: Number(li.quantity), rate: Number(li.unitPrice) }))
        : [emptyLine()],
    );
    setErrors({});
  }, []);

  const addLine = useCallback(() => setLines((p) => [...p, emptyLine()]), []);
  const removeLine = useCallback((idx: number) => setLines((p) => p.filter((_, i) => i !== idx)), []);
  const updateLine = useCallback((idx: number, field: keyof RILineValue, value: string | number) => {
    setLines((p) => p.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const grandTotal = subtotal + tax;

  const submit = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Give the schedule a name';
    if (!editing && !customerId) e.customerId = 'Select a customer';
    if (!startDate) e.startDate = 'Pick a start date';
    const validLines = lines.filter((l) => l.description && l.rate > 0);
    if (validLines.length === 0) e.lines = 'Add at least one line with an amount';
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});

    const lineItems = validLines.map((l) => ({ description: l.description, quantity: l.qty, unitPrice: l.rate }));
    const common = {
      name: name.trim(),
      frequency,
      startDate,
      endDate: endDate || undefined,
      dueDays: Number(dueDays) || 0,
      taxRate,
      autoSend,
      notes: notes || undefined,
      lineItems,
    };

    try {
      if (editing) {
        await onUpdate(editing.id, common);
      } else {
        await onCreate({ ...common, customerId });
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save recurring invoice:', err);
    }
  }, [name, customerId, frequency, startDate, endDate, dueDays, autoSend, notes, taxRate, lines, editing, onCreate, onUpdate, onSuccess]);

  return {
    editing,
    name, setName,
    customerId, setCustomerId,
    frequency, setFrequency,
    startDate, setStartDate,
    endDate, setEndDate,
    dueDays, setDueDays,
    autoSend, setAutoSend,
    notes, setNotes,
    taxRate,
    lines, addLine, removeLine, updateLine,
    subtotal, tax, grandTotal,
    errors,
    reset, loadRecurringInvoice, submit,
  };
}
