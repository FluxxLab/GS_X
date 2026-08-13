'use client';

import { useQuery } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { ReportQueryParams } from '../types/finance';

export function useFinanceDashboard(params?: ReportQueryParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['finance', 'dashboard', params],
    queryFn: () => financeService.getDashboard(params),
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error,
  };
}
