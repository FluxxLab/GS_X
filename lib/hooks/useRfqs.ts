'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { RfqQueryParams, CreateRfqPayload } from '../types/finance';

export function useRfqs(params?: RfqQueryParams) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'rfqs', params],
    queryFn: () => financeService.getRfqs(params),
  });

  const createMutation = useMutation({ mutationFn: (p: CreateRfqPayload) => financeService.createRfq(p), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'rfqs'] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreateRfqPayload> }) => financeService.updateRfq(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'rfqs'] }) });
  const sendMutation = useMutation({ mutationFn: (id: string) => financeService.sendRfq(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'rfqs'] }) });
  const awardMutation = useMutation({ mutationFn: (id: string) => financeService.awardRfq(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'rfqs'] }) });
  const cancelMutation = useMutation({ mutationFn: (id: string) => financeService.cancelRfq(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'rfqs'] }) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => financeService.deleteRfq(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'rfqs'] }) });

  return {
    rfqs: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    createRfq: createMutation.mutateAsync,
    updateRfq: (id: string, data: Partial<CreateRfqPayload>) => updateMutation.mutateAsync({ id, data }),
    sendRfq: sendMutation.mutateAsync,
    awardRfq: awardMutation.mutateAsync,
    cancelRfq: cancelMutation.mutateAsync,
    deleteRfq: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'rfqs'] }),
  };
}
