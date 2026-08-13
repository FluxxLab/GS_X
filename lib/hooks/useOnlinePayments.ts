'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { InitiateCollectionPayload } from '../types/finance';

export function useOnlinePayments() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['finance', 'payment-gateway', 'status'],
    queryFn: () => financeService.getPaymentGatewayStatus(),
  });

  const txQuery = useQuery({
    queryKey: ['finance', 'gateway-transactions'],
    queryFn: () => financeService.getGatewayTransactions(),
  });

  const initiateMutation = useMutation({
    mutationFn: (payload: InitiateCollectionPayload) => financeService.initiateCollection(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'gateway-transactions'] }),
  });

  return {
    status: statusQuery.data ?? null,
    transactions: txQuery.data ?? [],
    loading: statusQuery.isLoading || txQuery.isLoading,
    initiateCollection: initiateMutation.mutateAsync,
    initiating: initiateMutation.isPending,
  };
}
