'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { BudgetQueryParams, CreateBudgetPayload, UpdateBudgetPayload } from '../types/finance';

export function useBudgets(params?: BudgetQueryParams, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'budgets', params],
    queryFn: () => financeService.getBudgets(params),
    enabled: options?.enabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateBudgetPayload) => financeService.createBudget(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetPayload }) => financeService.updateBudget(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteBudget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => financeService.activateBudget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => financeService.closeBudget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  });

  return {
    budgets: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createBudget: createMutation.mutateAsync,
    updateBudget: (id: string, payload: UpdateBudgetPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deleteBudget: deleteMutation.mutateAsync,
    activateBudget: activateMutation.mutateAsync,
    closeBudget: closeMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] }),
  };
}
