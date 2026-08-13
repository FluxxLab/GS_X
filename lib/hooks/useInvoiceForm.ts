'use client';

import { useState, useCallback } from 'react';
import type { Invoice, CreateInvoicePayload, UpdateInvoicePayload } from '@/lib/types/finance';
import { createInvoiceSchema } from '@/lib/validation/procure-to-pay';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface InvoiceLineItemValue {
  description: string;
  qty: number;
  rate: number;
}

const DEFAULT_INVOICE_NO = 'INV-2026-007';
const TAX_RATE = 7.5; // VAT %

const emptyLine = (): InvoiceLineItemValue => ({ description: '', qty: 1, rate: 0 });

interface Options {
  onCreate: (payload: CreateInvoicePayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateInvoicePayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create/edit-invoice form: line items, totals, zod gate + payload build. */
export function useInvoiceForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(DEFAULT_INVOICE_NO);
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<InvoiceLineItemValue[]>([emptyLine()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const taxRate = TAX_RATE;

  const reset = useCallback(() => {
    setEditingInvoice(null);
    setCustomer(''); setCustomerEmail(''); setIssueDate(''); setDueDate(''); setNotes('');
    setLines([emptyLine()]);
    setErrors({});
  }, []);

  const loadInvoice = useCallback((inv: Invoice) => {
    setEditingInvoice(inv);
    setCustomer(inv.customerName);
    setCustomerEmail(inv.customerEmail || '');
    setInvoiceNo(inv.invoiceNumber);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setNotes(inv.notes || '');
    setLines(inv.lineItems?.map((li) => ({ description: li.description, qty: Number(li.quantity), rate: Number(li.unitPrice) })) || [emptyLine()]);
    setErrors({});
  }, []);

  const addLine = useCallback(() => setLines((prev) => [...prev, emptyLine()]), []);
  const removeLine = useCallback((idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx)), []);
  const updateLine = useCallback((idx: number, field: keyof InvoiceLineItemValue, value: string | number) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const grandTotal = subtotal + tax;

  const submit = useCallback(async () => {
    const parsed = createInvoiceSchema.safeParse({ customerName: customer, issueDate, dueDate });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const payload: CreateInvoicePayload = {
      customerName: customer,
      customerEmail: customerEmail || undefined,
      issueDate,
      dueDate,
      taxRate,
      notes: notes || undefined,
      lineItems: lines.filter((l) => l.description && l.rate > 0).map((l) => ({
        description: l.description,
        quantity: l.qty,
        unitPrice: l.rate,
      })),
    };
    try {
      if (editingInvoice) {
        await onUpdate(editingInvoice.id, payload);
      } else {
        await onCreate(payload);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed:', err);
    }
  }, [customer, customerEmail, issueDate, dueDate, notes, lines, taxRate, editingInvoice, onCreate, onUpdate, onSuccess]);

  return {
    editingInvoice,
    customer, setCustomer,
    customerEmail, setCustomerEmail,
    invoiceNo, setInvoiceNo,
    issueDate, setIssueDate,
    dueDate, setDueDate,
    notes, setNotes,
    lines, addLine, removeLine, updateLine,
    taxRate, subtotal, tax, grandTotal,
    errors,
    reset, loadInvoice, submit,
  };
}
