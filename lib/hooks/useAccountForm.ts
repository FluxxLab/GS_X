'use client';

import { useState, useEffect, useCallback } from 'react';
import { lookupService } from '@/lib/services/lookup.service';
import type { Lookup } from '@/lib/types/lookup';
import type { Account as ApiAccount, CreateAccountPayload } from '@/lib/types/finance';
import { chartOfAccountSchema } from '@/lib/validation/finance-misc';

const EMPTY: CreateAccountPayload = { code: '', name: '', type: 'ASSET' };

interface Options {
  onCreate: (payload: CreateAccountPayload) => Promise<unknown>;
  onUpdate: (id: string, payload: CreateAccountPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create/edit form for a chart-of-accounts entry: values + zod + account-type lookups + save. */
export function useAccountForm({ onCreate, onUpdate, onSuccess }: Options) {
  const [editingAccount, setEditingAccount] = useState<ApiAccount | null>(null);
  const [form, setForm] = useState<CreateAccountPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [accountTypes, setAccountTypes] = useState<Lookup[]>([]);

  const loadTypes = useCallback(() => {
    lookupService.getByCategory('account_type').then(setAccountTypes).catch(() => {});
  }, []);

  useEffect(() => { loadTypes(); }, [loadTypes]);

  const startCreate = useCallback(() => {
    setEditingAccount(null);
    setForm({ code: '', name: '', type: 'ASSET', description: '' });
    setModalError(null);
    loadTypes();
  }, [loadTypes]);

  const startEdit = useCallback((account: ApiAccount) => {
    setEditingAccount(account);
    setForm({ code: account.code, name: account.name, type: account.type, description: account.description || '' });
    setModalError(null);
    loadTypes();
  }, [loadTypes]);

  const submit = useCallback(async () => {
    const parsed = chartOfAccountSchema.safeParse({ code: form.code, name: form.name });
    if (!parsed.success) {
      setModalError('Code and Name are required.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      if (editingAccount) {
        await onUpdate(editingAccount.id, form);
      } else {
        await onCreate(form);
      }
      onSuccess();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [form, editingAccount, onCreate, onUpdate, onSuccess]);

  return { editingAccount, form, setForm, saving, modalError, accountTypes, startCreate, startEdit, submit };
}
