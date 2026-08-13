'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { GrnQueryParams, CreateGrnPayload } from '../types/finance';

export function useGrns(params?: GrnQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'grn', params],
    queryFn: () => financeService.getGrns(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateGrnPayload) => financeService.createGrn(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'grn'] }),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => financeService.confirmGrn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'grn'] }),
  });

  const disputeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeService.disputeGrn(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'grn'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteGrn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'grn'] }),
  });

  return {
    grns: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createGrn: createMutation.mutateAsync,
    confirmGrn: confirmMutation.mutateAsync,
    disputeGrn: (id: string, reason: string) => disputeMutation.mutateAsync({ id, reason }),
    deleteGrn: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'grn'] }),
  };
}
