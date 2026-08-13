'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { VendorQueryParams, CreateVendorPayload, UpdateVendorPayload } from '../types/finance';

export function useVendors(params?: VendorQueryParams, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'vendors', params],
    enabled: options?.enabled,
    queryFn: () => financeService.getVendors(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateVendorPayload) => financeService.createVendor(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'vendors'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorPayload }) => financeService.updateVendor(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'vendors'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteVendor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'vendors'] }),
  });

  return {
    vendors: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createVendor: createMutation.mutateAsync,
    updateVendor: (id: string, payload: UpdateVendorPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deleteVendor: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'vendors'] }),
  };
}
