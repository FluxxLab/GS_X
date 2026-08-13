'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { LinkBankAccountPayload } from '../types/finance';

export function useBankFeeds() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['finance', 'bank-feeds', 'status'],
    queryFn: () => financeService.getBankFeedStatus(),
  });

  const linksQuery = useQuery({
    queryKey: ['finance', 'bank-feeds', 'links'],
    queryFn: () => financeService.getBankLinks(),
  });

  const invalidateLinks = () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-feeds', 'links'] });
  const invalidateTransactions = () => queryClient.invalidateQueries({ queryKey: ['finance', 'bank-transactions'] });

  const linkMutation = useMutation({
    mutationFn: (payload: LinkBankAccountPayload) => financeService.linkBankAccount(payload),
    onSuccess: invalidateLinks,
  });

  const unlinkMutation = useMutation({
    mutationFn: (id: string) => financeService.unlinkBankAccount(id),
    onSuccess: () => { invalidateLinks(); invalidateTransactions(); },
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => financeService.syncBankLink(id),
    onSuccess: () => { invalidateLinks(); invalidateTransactions(); },
  });

  return {
    status: statusQuery.data ?? null,
    links: linksQuery.data ?? [],
    loading: statusQuery.isLoading || linksQuery.isLoading,
    linkAccount: linkMutation.mutateAsync,
    unlinkAccount: unlinkMutation.mutateAsync,
    syncLink: syncMutation.mutateAsync,
    syncing: syncMutation.isPending,
    linking: linkMutation.isPending,
  };
}
