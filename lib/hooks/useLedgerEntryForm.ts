'use client';

import { useState, useCallback } from 'react';
import type { CreateJournalEntryPayload, JournalEntry } from '@/lib/types/finance';
import { createJournalEntrySchema } from '@/lib/validation/finance';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { emptyLine, fmtLedgerCurrency, type JLine } from '@/lib/constants/ledger';

interface Options {
  onCreate: (payload: CreateJournalEntryPayload) => Promise<JournalEntry>;
  onPost: (id: string) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Create-journal-entry form: date/description/attachments + multi-line debit /
 * credit state, the zod boundary gate, the in-balance validation, and the
 * save-draft / post submit handlers. Keeps the ledger page free of form soup.
 */
export function useLedgerEntryForm({ onCreate, onPost, onSuccess }: Options) {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [lines, setLines] = useState<JLine[]>([emptyLine(), emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateLine = useCallback((index: number, field: keyof JLine, value: string) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }, []);
  const addLine = useCallback(() => setLines((prev) => [...prev, emptyLine()]), []);
  const removeLine = useCallback((index: number) => {
    setLines((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const reset = useCallback(() => {
    setDate(''); setDescription(''); setAttachments([]); setError(null);
    setLines([emptyLine(), emptyLine()]); setFieldErrors({});
  }, []);

  function validateForm(): string | null {
    if (!date) return 'Please select a transaction date.';
    if (!description.trim()) return 'Please enter a description.';
    if (lines.length < 2) return 'A journal entry must have at least 2 lines.';
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].accountId) return `Please select an account for line ${i + 1}.`;
      const d = parseFloat(lines[i].debit) || 0;
      const c = parseFloat(lines[i].credit) || 0;
      if (d === 0 && c === 0) return `Please enter a debit or credit amount for line ${i + 1}.`;
      if (d > 0 && c > 0) return `Line ${i + 1} cannot have both debit and credit. Use separate lines.`;
    }
    const totalD = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
    const totalC = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    if (Math.abs(totalD - totalC) > 0.01) return `Total debits (${fmtLedgerCurrency(totalD)}) must equal total credits (${fmtLedgerCurrency(totalC)}).`;
    return null;
  }

  function buildLines() {
    return lines.map((l) => ({
      accountId: l.accountId,
      debit: parseFloat(l.debit) || 0,
      credit: parseFloat(l.credit) || 0,
      description,
    }));
  }

  function gateForm(): boolean {
    const totalD = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
    const totalC = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    const parsed = createJournalEntrySchema.safeParse({
      date,
      description,
      balanced: Math.abs(totalD - totalC) < 0.01,
      hasAmount: totalD > 0 || totalC > 0,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return false;
    }
    setFieldErrors({});
    return true;
  }

  const saveAsDraft = useCallback(async () => {
    setError(null);
    if (!gateForm()) return;
    const err = validateForm();
    if (err) { setError(err); return; }
    try {
      await onCreate({ date, description, lines: buildLines() });
      reset();
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, description, lines, onCreate, onSuccess, reset]);

  const postEntry = useCallback(async () => {
    setError(null);
    if (!gateForm()) return;
    const err = validateForm();
    if (err) { setError(err); return; }
    try {
      const created = await onCreate({ date, description, lines: buildLines() });
      if (created?.id) {
        await onPost(created.id);
      }
      reset();
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to post journal entry.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, description, lines, onCreate, onPost, onSuccess, reset]);

  return {
    date, setDate,
    description, setDescription,
    attachments, setAttachments,
    lines, updateLine, addLine, removeLine,
    error, setError, fieldErrors,
    reset, saveAsDraft, postEntry,
  };
}
