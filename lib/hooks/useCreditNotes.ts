'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type {
  CreditNoteQueryParams,
  CreateCreditNotePayload,
  UpdateCreditNotePayload,
} from '../types/finance';

export function useCreditNotes(params?: CreditNoteQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'credit-notes', params],
    queryFn: () => financeService.getCreditNotes(params),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['finance', 'credit-notes'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCreditNotePayload) =>
      financeService.createCreditNote(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCreditNotePayload }) =>
      financeService.updateCreditNote(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteCreditNote(id),
    onSuccess: invalidate,
  });

  const issueMutation = useMutation({
    mutationFn: (id: string) => financeService.issueCreditNote(id),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => financeService.cancelCreditNote(id),
    onSuccess: invalidate,
  });

  return {
    creditNotes: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createCreditNote: createMutation.mutateAsync,
    updateCreditNote: (id: string, payload: UpdateCreditNotePayload) =>
      updateMutation.mutateAsync({ id, data: payload }),
    deleteCreditNote: deleteMutation.mutateAsync,
    issueCreditNote: issueMutation.mutateAsync,
    cancelCreditNote: cancelMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}
