'use client';

import { useState, useCallback } from 'react';
import type { CreateIncidentPayload, IncidentType, IncidentSeverity, IncidentAttachment } from '@/lib/types/operations';

export interface IncidentFormValues {
  assetCode: string;
  assetName: string;
  type: IncidentType | '';
  severity: IncidentSeverity | '';
  description: string;
  location: string;
  witnessName: string;
  witnessStatement: string;
  estimatedLoss: string;
  reportedBy: string;
  attachments: IncidentAttachment[];
}

const EMPTY: IncidentFormValues = {
  assetCode: '', assetName: '', type: '', severity: '', description: '',
  location: '', witnessName: '', witnessStatement: '', estimatedLoss: '', reportedBy: '',
  attachments: [],
};

interface Options {
  onReport: (payload: CreateIncidentPayload) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Report-incident form: single values object + presence guard + payload build.
 * Original had no zod schema, so this stays non-blocking (preserves behavior).
 */
export function useAssetIncidentForm({ onReport, onSuccess }: Options) {
  const [values, setValues] = useState<IncidentFormValues>(EMPTY);

  const setField = useCallback(
    <K extends keyof IncidentFormValues>(key: K, value: IncidentFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => setValues(EMPTY), []);

  const submit = useCallback(async () => {
    if (!values.assetCode || !values.assetName || !values.type || !values.severity || !values.description || !values.reportedBy) return;
    try {
      await onReport({
        assetCode: values.assetCode,
        assetName: values.assetName,
        type: values.type as IncidentType,
        severity: values.severity as IncidentSeverity,
        reportedBy: values.reportedBy,
        reportedDate: new Date().toISOString(),
        description: values.description,
        location: values.location || undefined,
        witnessName: values.witnessName || undefined,
        witnessStatement: values.witnessStatement || undefined,
        estimatedLoss: values.estimatedLoss ? parseFloat(values.estimatedLoss) : undefined,
        attachments: values.attachments.length ? values.attachments : undefined,
      });
      reset();
      onSuccess();
    } catch {
      /* silent */
    }
  }, [values, onReport, onSuccess, reset]);

  return { values, setField, reset, submit };
}
