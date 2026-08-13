'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsService } from '../services/operations.service';
import type { IncidentQueryParams, CreateIncidentPayload, UpdateIncidentPayload } from '../types/operations';

export function useAssetIncidents(params?: IncidentQueryParams) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operations', 'incidents', params],
    queryFn: () => operationsService.getIncidents(params),
  });

  const reportMutation = useMutation({
    mutationFn: (payload: CreateIncidentPayload) => operationsService.reportIncident(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operations', 'incidents'] }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { resolution: string; actualLoss?: number } }) =>
      operationsService.resolveIncident(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations', 'incidents'] });
      // A write-off disposes the fixed asset + posts a GL entry.
      qc.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidentPayload }) =>
      operationsService.updateIncident(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operations', 'incidents'] }),
  });

  return {
    incidents: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    reportIncident: reportMutation.mutateAsync,
    reporting: reportMutation.isPending,
    resolveIncident: resolveMutation.mutateAsync,
    updateIncident: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
    refresh: () => qc.invalidateQueries({ queryKey: ['operations', 'incidents'] }),
  };
}
