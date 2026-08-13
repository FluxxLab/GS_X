'use client';

import { useState, useCallback } from 'react';
import { lookupService } from '@/lib/services/lookup.service';
import type { Lookup, CreateLookupPayload } from '@/lib/types/lookup';
import { lookupEntrySchema } from '@/lib/validation/finance-misc';

const emptyForm = (category: string): CreateLookupPayload => ({
  category,
  value: '',
  label: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  metadata: {},
});

interface Options {
  onSuccess: () => void;
}

/** Create/edit form for a finance-settings lookup entry: values + zod + save. */
export function useLookupForm({ onSuccess }: Options) {
  const [editingItem, setEditingItem] = useState<Lookup | null>(null);
  const [form, setForm] = useState<CreateLookupPayload>(emptyForm(''));
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const startCreate = useCallback((category: string) => {
    setEditingItem(null);
    setForm(emptyForm(category));
    setModalError(null);
  }, []);

  const startEdit = useCallback((item: Lookup) => {
    setEditingItem(item);
    setForm({
      category: item.category,
      value: item.value,
      label: item.label,
      description: item.description || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      metadata: item.metadata || {},
    });
    setModalError(null);
  }, []);

  const submit = useCallback(async () => {
    const parsed = lookupEntrySchema.safeParse({ value: form.value, label: form.label });
    if (!parsed.success) {
      setModalError('Value and Label are required.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      if (editingItem) {
        await lookupService.update(editingItem.id, form);
      } else {
        await lookupService.create(form);
      }
      onSuccess();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [form, editingItem, onSuccess]);

  return { editingItem, form, setForm, saving, modalError, setModalError, startCreate, startEdit, submit };
}
