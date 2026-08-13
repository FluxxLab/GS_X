'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturingService } from '../services/manufacturing.service';
import type {
  QualityCheckQueryParams,
  CreateQualityCheckPayload,
  UpdateQualityCheckPayload,
} from '../types/manufacturing';

export function useQualityChecks(params?: QualityCheckQueryParams) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['manufacturing', 'quality-checks'] });
    queryClient.invalidateQueries({ queryKey: ['manufacturing', 'pending-batches'] });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['manufacturing', 'quality-checks', params],
    queryFn: () => manufacturingService.getQualityChecks(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateQualityCheckPayload) => manufacturingService.createQualityCheck(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQualityCheckPayload }) => manufacturingService.updateQualityCheck(id, data),
    onSuccess: invalidate,
  });

  const passMutation = useMutation({
    mutationFn: (id: string) => manufacturingService.passQualityCheck(id),
    onSuccess: invalidate,
  });

  const failMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => manufacturingService.failQualityCheck(id, reason),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => manufacturingService.deleteQualityCheck(id),
    onSuccess: invalidate,
  });

  return {
    checks: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createCheck: createMutation.mutateAsync,
    updateCheck: (id: string, payload: UpdateQualityCheckPayload) => updateMutation.mutateAsync({ id, data: payload }),
    passCheck: passMutation.mutateAsync,
    failCheck: (id: string, reason: string) => failMutation.mutateAsync({ id, reason }),
    deleteCheck: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}

export function usePendingBatches() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'pending-batches'] });

  const { data, isLoading } = useQuery({
    queryKey: ['manufacturing', 'pending-batches'],
    queryFn: () => manufacturingService.getPendingBatches(),
  });

  const releaseMutation = useMutation({
    mutationFn: (lineId: string) => manufacturingService.releaseBatch(lineId),
    onSuccess: invalidate,
  });

  const recallMutation = useMutation({
    mutationFn: (lineId: string) => manufacturingService.recallBatch(lineId),
    onSuccess: invalidate,
  });

  return {
    batches: data ?? [],
    loading: isLoading,
    releaseBatch: releaseMutation.mutateAsync,
    recallBatch: recallMutation.mutateAsync,
    refresh: invalidate,
  };
}
