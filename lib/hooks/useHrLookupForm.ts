'use client';

import { useState, useCallback } from 'react';
import { lookupService } from '@/lib/services/lookup.service';
import type { Lookup, CreateLookupPayload } from '@/lib/types/lookup';
import { createLookupSchema } from '@/lib/validation/settings';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { EMPTY_LOOKUP_FORM } from '@/lib/constants/settings-hr';

interface Options {
  onSuccess: () => void;
}

/**
 * Owns the create/edit HR lookup form: a single values object, zod validation at
 * the boundary (createLookupSchema), edit-prefill, and submit. Behavior preserved
 * byte-for-byte from the original HR Configuration page.
 */
export function useHrLookupForm({ onSuccess }: Options) {
  const [form, setForm] = useState<CreateLookupPayload>(EMPTY_LOOKUP_FORM(''));
  const [editingItem, setEditingItem] = useState<Lookup | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const startCreate = useCallback((category: string) => {
    setEditingItem(null);
    setForm(EMPTY_LOOKUP_FORM(category));
    setModalError(null);
    setFieldErrors({});
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
    setFieldErrors({});
  }, []);

  const submit = useCallback(async () => {
    const parsed = createLookupSchema.safeParse({ value: form.value, label: form.label });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
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

  return { form, setForm, editingItem, saving, modalError, fieldErrors, startCreate, startEdit, submit };
}
