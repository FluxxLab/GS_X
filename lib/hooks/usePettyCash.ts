'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { PettyCashQueryParams, CreatePettyCashPayload } from '../types/finance';

export function usePettyCash(params?: PettyCashQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'petty-cash', params],
    queryFn: () => financeService.getPettyCashTransactions(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePettyCashPayload) => financeService.createPettyCashTransaction(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'petty-cash'] }),
  });

  const replenishMutation = useMutation({
    mutationFn: (data: { amount: number; custodian: string }) => financeService.replenishPettyCash(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'petty-cash'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => financeService.approvePettyCash(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['finance', 'petty-cash'] }); queryClient.invalidateQueries({ queryKey: ['finance', 'petty-cash-balance'] }); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => financeService.rejectPettyCash(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'petty-cash'] }),
  });

  return {
    transactions: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createTransaction: createMutation.mutateAsync,
    replenish: replenishMutation.mutateAsync,
    approvePettyCash: approveMutation.mutateAsync,
    rejectPettyCash: rejectMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'petty-cash'] }),
  };
}

export function usePettyCashBalance(custodian?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'petty-cash-balance', custodian],
    queryFn: () => financeService.getPettyCashBalance(custodian),
  });

  // API may return array or object
  const balanceValue = Array.isArray(data) ? (data[0]?.balance ?? 0) : (data?.balance ?? 0);

  return {
    balance: Number(balanceValue),
    loading: isLoading,
  };
}
