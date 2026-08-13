'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { FiscalPeriodQueryParams, CreateFiscalPeriodPayload } from '../types/finance';

export function useFiscalPeriods(params?: FiscalPeriodQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'fiscal-periods', params],
    queryFn: () => financeService.getFiscalPeriods(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateFiscalPeriodPayload) => financeService.createFiscalPeriod(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fiscal-periods'] }),
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => financeService.closeFiscalPeriod(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fiscal-periods'] }),
  });

  const reopenMutation = useMutation({
    mutationFn: (id: string) => financeService.reopenFiscalPeriod(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fiscal-periods'] }),
  });

  return {
    periods: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createPeriod: createMutation.mutateAsync,
    closePeriod: closeMutation.mutateAsync,
    reopenPeriod: reopenMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fiscal-periods'] }),
  };
}
