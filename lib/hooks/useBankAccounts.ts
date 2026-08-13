'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { CreateBankAccountPayload, BankTransactionQueryParams, CreateBankTransactionPayload } from '../types/finance';

export function useBankAccounts() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'bank-accounts'],
    queryFn: () => financeService.getBankAccounts(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateBankAccountPayload) => financeService.createBankAccount(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-accounts'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBankAccountPayload> }) => financeService.updateBankAccount(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-accounts'] }),
  });

  return {
    accounts: data ?? [],
    loading: isLoading,
    createAccount: createMutation.mutateAsync,
    updateAccount: (id: string, payload: Partial<CreateBankAccountPayload>) => updateMutation.mutateAsync({ id, data: payload }),
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-accounts'] }),
  };
}

export function useBankTransactions(params?: BankTransactionQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'bank-transactions', params],
    queryFn: () => financeService.getBankTransactions(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateBankTransactionPayload) => financeService.createBankTransaction(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-transactions'] }),
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ id, reconciledWith }: { id: string; reconciledWith: string }) => financeService.reconcileTransaction(id, reconciledWith),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-transactions'] }),
  });

  const unreconcileMutation = useMutation({
    mutationFn: (id: string) => financeService.unreconcileTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-transactions'] }),
  });

  return {
    transactions: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createTransaction: createMutation.mutateAsync,
    reconcileTransaction: (id: string, reconciledWith: string) => reconcileMutation.mutateAsync({ id, reconciledWith }),
    unreconcileTransaction: unreconcileMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-transactions'] }),
  };
}

export function useReconciliationSummary(bankAccountId: string, params?: { startDate?: string; endDate?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reconciliation-summary', bankAccountId, params],
    queryFn: () => financeService.getReconciliationSummary(bankAccountId, params),
    enabled: !!bankAccountId,
  });

  return {
    summary: data ?? null,
    loading: isLoading,
  };
}
