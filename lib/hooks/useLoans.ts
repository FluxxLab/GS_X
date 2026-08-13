'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { LoanQueryParams, CreateLoanPayload } from '../types/finance';

export function useLoans(params?: LoanQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'loans', params],
    queryFn: () => financeService.getLoans(params),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['finance', 'loans'] });
    queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateLoanPayload) => financeService.createLoan(payload),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteLoan(id),
    onSuccess: invalidate,
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => financeService.cancelLoan(id),
    onSuccess: invalidate,
  });
  const runNowMutation = useMutation({
    mutationFn: (id: string) => financeService.runLoanNow(id),
    onSuccess: invalidate,
  });

  return {
    loans: data ?? [],
    loading: isLoading,
    createLoan: createMutation.mutateAsync,
    deleteLoan: deleteMutation.mutateAsync,
    cancelLoan: cancelMutation.mutateAsync,
    runLoanNow: runNowMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}

export function useLoanSchedule(id: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'loans', 'schedule', id],
    queryFn: () => financeService.getLoanSchedule(id as string),
    enabled: !!id,
  });
  return { data: data ?? null, loading: isLoading };
}
