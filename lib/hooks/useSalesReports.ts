'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '../services/sales.service';
import type {
  SalesReportQueryParams,
  CreateSalesReportPayload,
  UpdateSalesReportPayload,
} from '../types/sales';

export function useSalesReports(params?: SalesReportQueryParams) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['sales', 'reports'] });

  const { data, isLoading } = useQuery({
    queryKey: ['sales', 'reports', params],
    queryFn: () => salesService.getReports(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSalesReportPayload) => salesService.createReport(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesReportPayload }) => salesService.updateReport(id, data),
    onSuccess: invalidate,
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => salesService.submitReport(id),
    onSuccess: invalidate,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => salesService.approveReport(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => salesService.rejectReport(id, reason),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salesService.deleteReport(id),
    onSuccess: invalidate,
  });

  return {
    reports: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createReport: createMutation.mutateAsync,
    updateReport: (id: string, payload: UpdateSalesReportPayload) => updateMutation.mutateAsync({ id, data: payload }),
    submitReport: submitMutation.mutateAsync,
    approveReport: approveMutation.mutateAsync,
    rejectReport: (id: string, reason: string) => rejectMutation.mutateAsync({ id, reason }),
    deleteReport: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}
