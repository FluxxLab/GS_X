'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type {
  RecurringInvoiceQueryParams,
  CreateRecurringInvoicePayload,
  UpdateRecurringInvoicePayload,
} from '../types/finance';

export function useRecurringInvoices(params?: RecurringInvoiceQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'recurring-invoices', params],
    queryFn: () => financeService.getRecurringInvoices(params),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['finance', 'recurring-invoices'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateRecurringInvoicePayload) => financeService.createRecurringInvoice(payload),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringInvoicePayload }) =>
      financeService.updateRecurringInvoice(id, data),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteRecurringInvoice(id),
    onSuccess: invalidate,
  });
  const pauseMutation = useMutation({
    mutationFn: (id: string) => financeService.pauseRecurringInvoice(id),
    onSuccess: invalidate,
  });
  const resumeMutation = useMutation({
    mutationFn: (id: string) => financeService.resumeRecurringInvoice(id),
    onSuccess: invalidate,
  });
  const runNowMutation = useMutation({
    mutationFn: (id: string) => financeService.runRecurringInvoiceNow(id),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
    },
  });

  return {
    recurringInvoices: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createRecurringInvoice: createMutation.mutateAsync,
    updateRecurringInvoice: (id: string, payload: UpdateRecurringInvoicePayload) =>
      updateMutation.mutateAsync({ id, data: payload }),
    deleteRecurringInvoice: deleteMutation.mutateAsync,
    pauseRecurringInvoice: pauseMutation.mutateAsync,
    resumeRecurringInvoice: resumeMutation.mutateAsync,
    runRecurringInvoiceNow: runNowMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}
