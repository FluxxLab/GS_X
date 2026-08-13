'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { ReportQueryParams, CustomerStatementParams, VendorStatementParams } from '../types/finance';

export function useProfitLoss(params?: ReportQueryParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'profit-loss', params],
    queryFn: () => financeService.getProfitLoss(params),
  });
  return { data: data ?? null, loading: isLoading };
}

export function useBalanceSheet(params?: { asOfDate?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'balance-sheet', params],
    queryFn: () => financeService.getBalanceSheet(params),
  });
  return { data: data ?? null, loading: isLoading };
}

export function useCashFlow(params?: ReportQueryParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'cash-flow', params],
    queryFn: () => financeService.getCashFlow(params),
  });
  return { data: data ?? null, loading: isLoading };
}

export function useAgedReceivables(params?: { asOfDate?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'aged-receivables', params],
    queryFn: () => financeService.getAgedReceivables(params),
  });
  return { data: data ?? null, loading: isLoading };
}

export function useAgedPayables(params?: { asOfDate?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'aged-payables', params],
    queryFn: () => financeService.getAgedPayables(params),
  });
  return { data: data ?? null, loading: isLoading };
}

export function useTrialBalance(params?: { asOfDate?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'trial-balance', params],
    queryFn: () => financeService.getTrialBalance(params),
  });
  return { data: data ?? null, loading: isLoading };
}

export function useCustomerStatement(params: CustomerStatementParams | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'customer-statement', params],
    queryFn: () => financeService.getCustomerStatement(params as CustomerStatementParams),
    enabled: !!params?.customerId,
  });
  return { data: data ?? null, loading: isLoading };
}

export function useVendorStatement(params: VendorStatementParams | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'vendor-statement', params],
    queryFn: () => financeService.getVendorStatement(params as VendorStatementParams),
    enabled: !!params?.vendorId,
  });
  return { data: data ?? null, loading: isLoading };
}

export function useSegmentPnl(params?: { startDate?: string; endDate?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'segment-pnl', params],
    queryFn: () => financeService.getSegmentPnl(params),
  });
  return { data: data ?? null, loading: isLoading };
}

export function useCashFlowForecast(params?: { months?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'cash-flow-forecast', params],
    queryFn: () => financeService.getCashFlowForecast(params),
  });
  return { data: data ?? null, loading: isLoading };
}

export function useBadDebtProvision(params?: { asOfDate?: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'bad-debt-provision', params],
    queryFn: () => financeService.getBadDebtProvision(params),
  });
  const postMutation = useMutation({
    mutationFn: (asOfDate?: string) => financeService.postBadDebtProvision(asOfDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'reports', 'bad-debt-provision'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
    },
  });
  return { data: data ?? null, loading: isLoading, postProvision: postMutation.mutateAsync, posting: postMutation.isPending };
}

export function useTaxSummary(params?: ReportQueryParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'reports', 'tax-summary', params],
    queryFn: () => financeService.getTaxSummary(params),
  });
  return { data: data ?? null, loading: isLoading };
}
