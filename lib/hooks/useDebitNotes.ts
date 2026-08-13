'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type {
  DebitNoteQueryParams,
  CreateDebitNotePayload,
  UpdateDebitNotePayload,
} from '../types/finance';

export function useDebitNotes(params?: DebitNoteQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'debit-notes', params],
    queryFn: () => financeService.getDebitNotes(params),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['finance', 'debit-notes'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateDebitNotePayload) => financeService.createDebitNote(payload),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDebitNotePayload }) =>
      financeService.updateDebitNote(id, data),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteDebitNote(id),
    onSuccess: invalidate,
  });
  const issueMutation = useMutation({
    mutationFn: (id: string) => financeService.issueDebitNote(id),
    onSuccess: invalidate,
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => financeService.cancelDebitNote(id),
    onSuccess: invalidate,
  });

  return {
    debitNotes: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createDebitNote: createMutation.mutateAsync,
    updateDebitNote: (id: string, payload: UpdateDebitNotePayload) =>
      updateMutation.mutateAsync({ id, data: payload }),
    deleteDebitNote: deleteMutation.mutateAsync,
    issueDebitNote: issueMutation.mutateAsync,
    cancelDebitNote: cancelMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}
