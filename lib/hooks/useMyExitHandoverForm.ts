'use client';

import { useCallback, useState } from 'react';
import type {
  HandoverNote,
  HandoverCategory,
  HandoverPriority,
  CreateHandoverNotePayload,
  UpdateHandoverNotePayload,
} from '@/lib/types/separation';
import { myExitHandoverSchema } from '@/lib/validation/employee-lifecycle';
import { zodFieldErrors } from '@/lib/validation/helpers';

interface HandoverFormValues {
  category: HandoverCategory;
  title: string;
  description: string;
  priority: HandoverPriority;
  assignedTo: string;
  dueDate: string;
}

const INITIAL: HandoverFormValues = {
  category: 'ONGOING_PROJECT',
  title: '',
  description: '',
  priority: 'MEDIUM',
  assignedTo: '',
  dueDate: '',
};

type FieldErrors = Partial<Record<keyof HandoverFormValues, string>>;

interface Deps {
  separationId: string;
  addHandover: (payload: CreateHandoverNotePayload) => Promise<unknown>;
  updateHandover: (args: { noteId: string; payload: UpdateHandoverNotePayload }) => Promise<unknown>;
  deleteHandover: (noteId: string) => Promise<unknown>;
}

/**
 * Owns the inline "Handover Note" form on the My Exit page: a single values
 * object (replacing the per-field useState soup), show/edit/delete-confirm UI
 * state, and add/update submit. Adds a non-blocking zod gate
 * (`myExitHandoverSchema`) that mirrors the original trimmed title+description
 * requirement; all other submit behavior (double-submit guard, reset on
 * success, silent error handling) is preserved byte-for-byte.
 */
export function useMyExitHandoverForm({ separationId, addHandover, updateHandover, deleteHandover }: Deps) {
  const [values, setValues] = useState<HandoverFormValues>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<HandoverNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const setField = useCallback(
    (field: keyof HandoverFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const resetForm = useCallback(() => {
    setValues(INITIAL);
    setErrors({});
    setEditingNote(null);
    setShowForm(false);
  }, []);

  const openCreateForm = useCallback(() => {
    setValues(INITIAL);
    setErrors({});
    setEditingNote(null);
    setShowForm(true);
  }, []);

  const openEditForm = useCallback((note: HandoverNote) => {
    setValues({
      category: note.category,
      title: note.title,
      description: note.description,
      priority: note.priority,
      assignedTo: note.assignedTo || '',
      dueDate: note.dueDate ? note.dueDate.split('T')[0] : '',
    });
    setErrors({});
    setEditingNote(note);
    setShowForm(true);
  }, []);

  const submit = useCallback(async () => {
    const parsed = myExitHandoverSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error) as FieldErrors);
      return;
    }
    setSaving(true);
    try {
      if (editingNote) {
        await updateHandover({
          noteId: editingNote.id,
          payload: {
            category: values.category,
            title: values.title,
            description: values.description,
            priority: values.priority,
            assignedTo: values.assignedTo || undefined,
            dueDate: values.dueDate || undefined,
          },
        });
      } else {
        await addHandover({
          separationId,
          category: values.category,
          title: values.title,
          description: values.description,
          priority: values.priority,
          assignedTo: values.assignedTo || undefined,
          dueDate: values.dueDate || undefined,
        });
      }
      resetForm();
    } catch {
      // Error handled silently (preserves original behavior)
    } finally {
      setSaving(false);
    }
  }, [values, editingNote, updateHandover, addHandover, separationId, resetForm]);

  const confirmDelete = useCallback(
    async (noteId: string) => {
      try {
        await deleteHandover(noteId);
        setDeleteConfirmId(null);
      } catch {
        // Error handled silently (preserves original behavior)
      }
    },
    [deleteHandover],
  );

  return {
    values,
    errors,
    setField,
    showForm,
    editingNote,
    saving,
    deleteConfirmId,
    setDeleteConfirmId,
    resetForm,
    openCreateForm,
    openEditForm,
    submit,
    confirmDelete,
  };
}

export type MyExitHandoverForm = ReturnType<typeof useMyExitHandoverForm>;
