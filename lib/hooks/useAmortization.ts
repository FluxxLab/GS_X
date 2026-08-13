'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type {
  AmortizationQueryParams,
  CreateAmortizationSchedulePayload,
  UpdateAmortizationSchedulePayload,
} from '../types/finance';

export function useAmortization(params?: AmortizationQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'amortization', params],
    queryFn: () => financeService.getAmortizationSchedules(params),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['finance', 'amortization'] });
    queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateAmortizationSchedulePayload) => financeService.createAmortizationSchedule(payload),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAmortizationSchedulePayload }) =>
      financeService.updateAmortizationSchedule(id, data),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteAmortizationSchedule(id),
    onSuccess: invalidate,
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => financeService.cancelAmortizationSchedule(id),
    onSuccess: invalidate,
  });
  const runNowMutation = useMutation({
    mutationFn: (id: string) => financeService.runAmortizationNow(id),
    onSuccess: invalidate,
  });

  return {
    schedules: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createSchedule: createMutation.mutateAsync,
    updateSchedule: (id: string, payload: UpdateAmortizationSchedulePayload) =>
      updateMutation.mutateAsync({ id, data: payload }),
    deleteSchedule: deleteMutation.mutateAsync,
    cancelSchedule: cancelMutation.mutateAsync,
    runNow: runNowMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}
