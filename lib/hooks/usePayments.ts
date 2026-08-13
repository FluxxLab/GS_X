'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { PaymentQueryParams, CreatePaymentPayload } from '../types/finance';

export function usePayments(params?: PaymentQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'payments', params],
    queryFn: () => financeService.getPayments(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePaymentPayload) => financeService.createPayment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] }),
  });

  return {
    payments: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createPayment: createMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] }),
  };
}
