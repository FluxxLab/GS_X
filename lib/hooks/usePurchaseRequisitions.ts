'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { PRQueryParams, CreatePRPayload } from '../types/finance';

export function usePurchaseRequisitions(params?: PRQueryParams) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'purchase-requisitions', params],
    queryFn: () => financeService.getPurchaseRequisitions(params),
  });

  const createMutation = useMutation({ mutationFn: (p: CreatePRPayload) => financeService.createPurchaseRequisition(p), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreatePRPayload> }) => financeService.updatePurchaseRequisition(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }) });
  const submitMutation = useMutation({ mutationFn: (id: string) => financeService.submitPR(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }) });
  const hodApproveMutation = useMutation({ mutationFn: (id: string) => financeService.hodApprovePR(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }) });
  const financeApproveMutation = useMutation({ mutationFn: (id: string) => financeService.financeApprovePR(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }) });
  const approveMutation = useMutation({ mutationFn: (id: string) => financeService.approvePR(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }) });
  const rejectMutation = useMutation({ mutationFn: ({ id, reason }: { id: string; reason?: string }) => financeService.rejectPR(id, reason), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => financeService.deletePurchaseRequisition(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }) });

  return {
    requisitions: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createPR: createMutation.mutateAsync,
    updatePR: (id: string, data: Partial<CreatePRPayload>) => updateMutation.mutateAsync({ id, data }),
    submitPR: submitMutation.mutateAsync,
    hodApprovePR: hodApproveMutation.mutateAsync,
    financeApprovePR: financeApproveMutation.mutateAsync,
    approvePR: approveMutation.mutateAsync,
    rejectPR: (id: string, reason?: string) => rejectMutation.mutateAsync({ id, reason }),
    deletePR: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-requisitions'] }),
  };
}
