'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { ExpenseQueryParams, CreateExpensePayload, UpdateExpensePayload } from '../types/finance';

export function useExpenses(params?: ExpenseQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'expenses', params],
    queryFn: () => financeService.getExpenses(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => financeService.createExpense(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpensePayload }) => financeService.updateExpense(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] }),
  });

  const hodApproveMutation = useMutation({
    mutationFn: (id: string) => financeService.hodApproveExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => financeService.approveExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => financeService.rejectExpense(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] }),
  });

  return {
    expenses: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createExpense: createMutation.mutateAsync,
    updateExpense: (id: string, payload: UpdateExpensePayload) => updateMutation.mutateAsync({ id, data: payload }),
    hodApproveExpense: hodApproveMutation.mutateAsync,
    approveExpense: approveMutation.mutateAsync,
    rejectExpense: (id: string, reason?: string) => rejectMutation.mutateAsync({ id, reason }),
    deleteExpense: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] }),
  };
}
