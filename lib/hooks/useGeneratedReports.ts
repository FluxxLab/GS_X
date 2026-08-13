'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { GeneratedReportQueryParams } from '../types/finance';

export function useGeneratedReports(params?: GeneratedReportQueryParams) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'generated-reports', params],
    queryFn: () => financeService.getGeneratedReports(params),
  });

  const generateMutation = useMutation({
    mutationFn: (payload: { type: string; title: string; period: string; parameters?: Record<string, unknown> }) =>
      financeService.generateReport(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'generated-reports'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteGeneratedReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance', 'generated-reports'] }),
  });

  return {
    reports: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    generateReport: generateMutation.mutateAsync,
    generating: generateMutation.isPending,
    deleteReport: deleteMutation.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: ['finance', 'generated-reports'] }),
  };
}
