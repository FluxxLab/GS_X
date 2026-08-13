'use client';

import { useState, useCallback } from 'react';
import { attendanceService } from '@/lib/services/attendance.service';
import type { OfficeIp, CreateOfficeIpPayload } from '@/lib/types/attendance';
import { EMPTY_OFFICE_IP_FORM } from '@/lib/constants/settings-hr';

interface Options {
  onSuccess: () => void;
}

/**
 * Owns the create/edit office-IP form on the HR Configuration page. The original
 * page validated inline (trim guards, no zod) — preserved exactly (non-blocking).
 */
export function useOfficeIpForm({ onSuccess }: Options) {
  const [form, setForm] = useState<CreateOfficeIpPayload>(EMPTY_OFFICE_IP_FORM);
  const [editing, setEditing] = useState<OfficeIp | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const startCreate = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_OFFICE_IP_FORM);
    setModalError(null);
  }, []);

  const startEdit = useCallback((ip: OfficeIp) => {
    setEditing(ip);
    setForm({ ip: ip.ip, label: ip.label, description: ip.description || '', isActive: ip.isActive });
    setModalError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!form.ip.trim() || !form.label.trim()) {
      setModalError('IP address and label are required.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      if (editing) {
        await attendanceService.updateOfficeIp(editing.id, form);
      } else {
        await attendanceService.createOfficeIp(form);
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
