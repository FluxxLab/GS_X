'use client';

import { useState, useCallback } from 'react';
import type {
  PaymentVoucher,
  DebitNote,
  CreateDebitNotePayload,
  UpdateDebitNotePayload,
} from '@/lib/types/finance';

export interface DebitNoteLineValue {
  description: string;
  qty: number;
  rate: number;
}

const emptyLine = (): DebitNoteLineValue => ({ description: '', qty: 1, rate: 0 });

interface Options {
  onCreate: (payload: CreateDebitNotePayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateDebitNotePayload) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Create/edit debit-note form. A debit note is always raised against a payment
 * voucher: selecting the reference voucher snapshots the vendor and pre-fills a
 * line from the voucher value (a full debit by default), which the user can trim.
 */
export function useDebitNoteForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [editingDebitNote, setEditingDebitNote] = useState<DebitNote | null>(null);
  const [referenceVoucher, setReferenceVoucherState] = useState<PaymentVoucher | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [lines, setLines] = useState<DebitNoteLineValue[]>([emptyLine()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = useCallback(() => {
    setEditingDebitNote(null);
    setReferenceVoucherState(null);
    setVendorName('');
    setReason('');
    setNotes('');
    setTaxRate(0);
    setLines([emptyLine()]);
    setErrors({});
  }, []);

  /** Pick the voucher being debited — snapshots vendor + pre-fills a line. */
  const setReferenceVoucher = useCallback((pv: PaymentVoucher | null) => {
    setReferenceVoucherState(pv);
    if (pv) {
      setVendorName(pv.payeeName);
      const gross = Number(pv.grossAmount) || 0;
      const vat = Number(pv.vatAmount) || 0;
      setTaxRate(gross > 0 ? Number(((vat / gross) * 100).toFixed(2)) : 0);
      setLines([{ description: pv.description || `Adjustment vs ${pv.pvNumber}`, qty: 1, rate: gross }]);
    }
    setErrors((e) => ({ ...e, referencePvId: '' }));
  }, []);

  const loadDebitNote = useCallback((dn: DebitNote) => {
    setEditingDebitNote(dn);
    setReferenceVoucherState(null);
    setVendorName(dn.vendorName);
    setReason(dn.reason || '');
    setNotes(dn.notes || '');
    setTaxRate(Number(dn.taxRate) || 0);
    setLines(
      dn.lineItems?.map((li) => ({ description: li.description, qty: Number(li.quantity), rate: Number(li.unitPrice) })) || [emptyLine()],
    );
    setErrors({});
  }, []);

  const addLine = useCallback(() => setLines((p) => [...p, emptyLine()]), []);
  const removeLine = useCallback((idx: number) => setLines((p) => p.filter((_, i) => i !== idx)), []);
  const updateLine = useCallback((idx: number, field: keyof DebitNoteLineValue, value: string | number) => {
    setLines((p) => p.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const grandTotal = subtotal + tax;

  const submit = useCallback(async () => {
    const nextErrors: Record<string, string> = {};
    if (!editingDebitNote && !referenceVoucher) {
      nextErrors.referencePvId = 'Select the voucher to debit';
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

    const lineItems = validLines.map((l) => ({ description: l.description, quantity: l.qty, unitPrice: l.rate }));

    try {
      if (editingDebitNote) {
        await onUpdate(editingDebitNote.id, { reason: reason || undefined, taxRate, notes: notes || undefined, lineItems });
      } else {
        await onCreate({ referencePvId: referenceVoucher!.id, reason: reason || undefined, taxRate, notes: notes || undefined, lineItems });
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save debit note:', err);
    }
  }, [editingDebitNote, referenceVoucher, lines, reason, taxRate, notes, onCreate, onUpdate, onSuccess]);

  return {
    editingDebitNote,
    referenceVoucher,
    setReferenceVoucher,
    vendorName,
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
    loadDebitNote,
    submit,
  };
}
