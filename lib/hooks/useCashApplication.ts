'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { ApplyCreditPayload, CreateRefundPayload } from '../types/finance';

/**
 * On-account credit + refunds. Lists receipts still holding unapplied credit,
 * applies that credit to invoices, and issues refunds — invalidating payments,
 * invoices and refunds so every affected view refreshes.
 */
export function useCashApplication(refundParams?: { page?: number; limit?: number; search?: string }) {
  const queryClient = useQueryClient();

  const onAccount = useQuery({
    queryKey: ['finance', 'on-account'],
    queryFn: () => financeService.getOnAccountCredits(),
  });

  const refunds = useQuery({
    queryKey: ['finance', 'refunds', refundParams],
    queryFn: () => financeService.getRefunds(refundParams),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['finance', 'on-account'] });
    queryClient.invalidateQueries({ queryKey: ['finance', 'refunds'] });
    queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] });
    queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
  };

  const applyCreditMutation = useMutation({
    mutationFn: (payload: ApplyCreditPayload) => financeService.applyCredit(payload),
    onSuccess: invalidate,
  });

  const refundMutation = useMutation({
    mutationFn: (payload: CreateRefundPayload) => financeService.createRefund(payload),
    onSuccess: invalidate,
  });

  return {
    onAccountCredits: onAccount.data ?? [],
    onAccountLoading: onAccount.isLoading,
    refunds: refunds.data?.data ?? [],
    refundsTotal: refunds.data?.total ?? 0,
    refundsTotalPages: refunds.data?.totalPages ?? 1,
    refundsLoading: refunds.isLoading,
    applyCredit: applyCreditMutation.mutateAsync,
    createRefund: refundMutation.mutateAsync,
    applying: applyCreditMutation.isPending,
    refunding: refundMutation.isPending,
    refresh: invalidate,
  };
}
