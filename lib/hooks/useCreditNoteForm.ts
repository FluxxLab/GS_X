'use client';

import { useState, useCallback } from 'react';
import type {
  Invoice,
  CreditNote,
  CreateCreditNotePayload,
  UpdateCreditNotePayload,
} from '@/lib/types/finance';

export interface CreditNoteLineValue {
  description: string;
  qty: number;
  rate: number;
}

const emptyLine = (): CreditNoteLineValue => ({
  description: '',
  qty: 1,
  rate: 0,
});

interface Options {
  onCreate: (payload: CreateCreditNotePayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateCreditNotePayload) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Create/edit credit-note form. A credit note is always raised against an
 * invoice: selecting the reference invoice snapshots the customer and pre-fills
 * the lines from that invoice (a full credit by default), which the user can
 * then trim down to a partial credit.
 */
export function useCreditNoteForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [editingCreditNote, setEditingCreditNote] = useState<CreditNote | null>(
    null,
  );
  const [referenceInvoice, setReferenceInvoiceState] = useState<Invoice | null>(
    null,
  );
  const [customerName, setCustomerName] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [lines, setLines] = useState<CreditNoteLineValue[]>([emptyLine()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = useCallback(() => {
    setEditingCreditNote(null);
    setReferenceInvoiceState(null);
    setCustomerName('');
    setReason('');
    setNotes('');
    setTaxRate(0);
    setLines([emptyLine()]);
    setErrors({});
  }, []);

  /** Pick the invoice being credited — snapshots customer + pre-fills lines. */
  const setReferenceInvoice = useCallback((inv: Invoice | null) => {
    setReferenceInvoiceState(inv);
    if (inv) {
      setCustomerName(inv.customerName);
      setTaxRate(Number(inv.taxRate) || 0);
      setLines(
        inv.lineItems?.length
          ? inv.lineItems.map((li) => ({
              description: li.description,
              qty: Number(li.quantity),
              rate: Number(li.unitPrice),
            }))
          : [emptyLine()],
      );
    }
    setErrors((e) => ({ ...e, referenceInvoiceId: '' }));
  }, []);

  const loadCreditNote = useCallback((cn: CreditNote) => {
    setEditingCreditNote(cn);
    setReferenceInvoiceState(null);
    setCustomerName(cn.customerName);
    setReason(cn.reason || '');
    setNotes(cn.notes || '');
    setTaxRate(Number(cn.taxRate) || 0);
    setLines(
      cn.lineItems?.map((li) => ({
        description: li.description,
        qty: Number(li.quantity),
        rate: Number(li.unitPrice),
      })) || [emptyLine()],
    );
    setErrors({});
  }, []);

  const addLine = useCallback(
    () => setLines((prev) => [...prev, emptyLine()]),
    [],
  );
  const removeLine = useCallback(
    (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx)),
    [],
  );
  const updateLine = useCallback(
    (idx: number, field: keyof CreditNoteLineValue, value: string | number) => {
      setLines((prev) =>
        prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
      );
    },
    [],
  );

  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const grandTotal = subtotal + tax;

  const submit = useCallback(async () => {
    const nextErrors: Record<string, string> = {};
    if (!editingCreditNote && !referenceInvoice) {
      nextErrors.referenceInvoiceId = 'Select the invoice to credit';
    }
    const validLines = lines.filter((l) => l.description && l.rate > 0);
    if (validLines.length === 0) {
      nextErrors.lines = 'Add at least one line with an amount';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const lineItems = validLines.map((l) => ({
      description: l.description,
      quantity: l.qty,
      unitPrice: l.rate,
    }));

    try {
      if (editingCreditNote) {
        await onUpdate(editingCreditNote.id, {
          reason: reason || undefined,
          taxRate,
          notes: notes || undefined,
          lineItems,
        });
      } else {
        await onCreate({
          referenceInvoiceId: referenceInvoice!.id,
          reason: reason || undefined,
          taxRate,
          notes: notes || undefined,
          lineItems,
        });
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save credit note:', err);
    }
  }, [
    editingCreditNote,
    referenceInvoice,
    lines,
    reason,
    taxRate,
    notes,
    onCreate,
    onUpdate,
    onSuccess,
  ]);

  return {
    editingCreditNote,
    referenceInvoice,
    setReferenceInvoice,
    customerName,
    reason,
    setReason,
    notes,
    setNotes,
    taxRate,
    lines,
    addLine,
    removeLine,
    updateLine,
    subtotal,
    tax,
    grandTotal,
    errors,
    reset,
    loadCreditNote,
    submit,
  };
}
