'use client';

import { useState, useCallback } from 'react';
import type { CreateWorkOrderPayload, MaintenanceType, WorkOrderPriority } from '@/lib/types/operations';
import { createWorkOrderSchema } from '@/lib/validation/operations';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { authService } from '@/lib/services/auth.service';

export interface WorkOrderFormValues {
  assetName: string;
  title: string;
  description: string;
  type: MaintenanceType;
  priority: WorkOrderPriority;
  assignedTo: string;
  scheduledDate: string;
  estCost: string;
}

const EMPTY: WorkOrderFormValues = {
  assetName: '', title: '', description: '', type: 'CORRECTIVE', priority: 'MEDIUM',
  assignedTo: '', scheduledDate: '', estCost: '',
};

interface Options {
  onCreate: (payload: CreateWorkOrderPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/** Create-work-order form: values + zod validation at the boundary + payload build. */
export function useWorkOrderForm({ onCreate, onSuccess }: Options) {
  const [values, setValues] = useState<WorkOrderFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof WorkOrderFormValues>(key: K, value: WorkOrderFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => { setValues(EMPTY); setErrors({}); }, []);

  const submit = useCallback(async () => {
    const parsed = createWorkOrderSchema.safeParse({
      assetName: values.assetName,
      title: values.title,
      description: values.description,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const u = authService.getUser();
    const reportedBy = u ? `${u.firstName} ${u.lastName}`.trim() : 'System';
    try {
      await onCreate({
        assetName: values.assetName,
        title: values.title,
        description: values.description,
        maintenanceType: values.type,
        priority: values.priority,
        reportedBy,
        assignedTo: values.assignedTo || undefined,
        scheduledDate: values.scheduledDate || undefined,
        estimatedCost: values.estCost ? parseFloat(values.estCost) : undefined,
      });
      reset();
      onSuccess();
    } catch {
      /* silent */
    }
  }, [values, onCreate, onSuccess, reset]);

  return { values, setField, errors, reset, submit };
}
