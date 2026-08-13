'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { Account, AccountQueryParams, CreateAccountPayload, UpdateAccountPayload } from '../types/finance';

export function useAccounts(params?: AccountQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'accounts', params],
    queryFn: () => financeService.getAccounts(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAccountPayload) => financeService.createAccount(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountPayload }) => financeService.updateAccount(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteAccount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] }),
  });

  // API returns paginated { data: [], total, ... } or flat array
  const paginated = data as unknown as { data?: Account[]; total?: number } | undefined;
  const accounts: Account[] = Array.isArray(data) ? data : paginated?.data ?? [];

  return {
    accounts,
    total: Array.isArray(data) ? data.length : paginated?.total ?? 0,
    loading: isLoading,
    createAccount: createMutation.mutateAsync,
    updateAccount: (id: string, payload: UpdateAccountPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deleteAccount: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] }),
  };
}
