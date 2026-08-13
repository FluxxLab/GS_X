'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturingService } from '../services/manufacturing.service';
import type {
  ProductionReportQueryParams,
  CreateProductionReportPayload,
  UpdateProductionReportPayload,
} from '../types/manufacturing';

export function useProductionReports(params?: ProductionReportQueryParams) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'production-reports'] });

  const { data, isLoading } = useQuery({
    queryKey: ['manufacturing', 'production-reports', params],
    queryFn: () => manufacturingService.getProductionReports(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductionReportPayload) => manufacturingService.createProductionReport(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductionReportPayload }) => manufacturingService.updateProductionReport(id, data),
    onSuccess: invalidate,
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => manufacturingService.submitProductionReport(id),
    onSuccess: invalidate,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => manufacturingService.approveProductionReport(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => manufacturingService.rejectProductionReport(id, reason),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => manufacturingService.deleteProductionReport(id),
    onSuccess: invalidate,
  });

  return {
    reports: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createReport: createMutation.mutateAsync,
    updateReport: (id: string, payload: UpdateProductionReportPayload) => updateMutation.mutateAsync({ id, data: payload }),
    submitReport: submitMutation.mutateAsync,
    approveReport: approveMutation.mutateAsync,
    rejectReport: (id: string, reason: string) => rejectMutation.mutateAsync({ id, reason }),
    deleteReport: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}
