'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { FixedAssetQueryParams, CreateFixedAssetPayload, UpdateFixedAssetPayload } from '../types/finance';

export function useFixedAssets(params?: FixedAssetQueryParams, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'fixed-assets', params],
    queryFn: () => financeService.getFixedAssets(params),
    enabled: options?.enabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateFixedAssetPayload) => financeService.createFixedAsset(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFixedAssetPayload }) => financeService.updateFixedAsset(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] }),
  });

  const disposeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { disposalDate: string; disposalAmount: number } }) => financeService.disposeFixedAsset(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] }),
  });

  const runDepreciationMutation = useMutation({
    mutationFn: (data: { month: number; year: number }) => financeService.runDepreciation(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] }),
  });

  return {
    assets: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createAsset: createMutation.mutateAsync,
    updateAsset: (id: string, payload: UpdateFixedAssetPayload) => updateMutation.mutateAsync({ id, data: payload }),
    disposeAsset: (id: string, payload: { disposalDate: string; disposalAmount: number }) => disposeMutation.mutateAsync({ id, data: payload }),
    runDepreciation: runDepreciationMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    disposing: disposeMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] }),
  };
}
