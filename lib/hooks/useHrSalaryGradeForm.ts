'use client';

import { useState, useCallback } from 'react';
import { salaryGradeService } from '@/lib/services/salary-grade.service';
import type { SalaryGrade, CreateSalaryGradePayload } from '@/lib/types/salary-grade';
import { EMPTY_HR_GRADE_FORM } from '@/lib/constants/settings-hr';

interface Options {
  onSuccess: () => void;
}

/**
 * Owns the create/edit salary-grade form on the HR Configuration page. The
 * original page validated inline (trim guards, no zod) — preserved exactly here
 * (non-blocking; the dedicated /salary-grades page uses the zod schema).
 */
export function useHrSalaryGradeForm({ onSuccess }: Options) {
  const [form, setForm] = useState<CreateSalaryGradePayload>(EMPTY_HR_GRADE_FORM);
  const [editing, setEditing] = useState<SalaryGrade | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const startCreate = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_HR_GRADE_FORM);
    setModalError(null);
  }, []);

  const startEdit = useCallback((g: SalaryGrade) => {
    setEditing(g);
    setForm({
      level: g.level,
      label: g.label,
      minimumSalary: Number(g.minimumSalary),
      maximumSalary: Number(g.maximumSalary),
      steps: g.steps,
      description: g.description || '',
      sortOrder: g.sortOrder,
      isActive: g.isActive,
    });
    setModalError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!form.level.trim() || !form.label.trim() || !form.minimumSalary || !form.maximumSalary) {
      setModalError('Grade level, label, and salary range are required.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      if (editing) {
        await salaryGradeService.update(editing.id, form);
      } else {
        await salaryGradeService.create(form);
      }
      onSuccess();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [form, editing, onSuccess]);

  return { form, setForm, editing, saving, modalError, startCreate, startEdit, submit };
}
