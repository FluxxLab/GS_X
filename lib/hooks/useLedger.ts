'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { LedgerQueryParams, CreateJournalEntryPayload } from '../types/finance';

export function useLedger(params?: LedgerQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'ledger', params],
    queryFn: () => financeService.getJournalEntries(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateJournalEntryPayload) => financeService.createJournalEntry(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] }),
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => financeService.postJournalEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] }),
  });

  const voidMutation = useMutation({
    mutationFn: (id: string) => financeService.voidJournalEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] }),
  });

  return {
    entries: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createEntry: createMutation.mutateAsync,
    postEntry: postMutation.mutateAsync,
    voidEntry: voidMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] }),
  };
}
