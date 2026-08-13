'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { CreateCostCenterPayload, UpdateCostCenterPayload } from '../types/finance';

export function useCostCenters(params?: { search?: string; isActive?: boolean }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'cost-centers', params],
    queryFn: () => financeService.getCostCenters(params),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['finance', 'cost-centers'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCostCenterPayload) => financeService.createCostCenter(payload),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCostCenterPayload }) => financeService.updateCostCenter(id, data),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteCostCenter(id),
    onSuccess: invalidate,
  });

  return {
    costCenters: data ?? [],
    loading: isLoading,
    createCostCenter: createMutation.mutateAsync,
    updateCostCenter: (id: string, payload: UpdateCostCenterPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deleteCostCenter: deleteMutation.mutateAsync,
    saving: createMutation.isPending || updateMutation.isPending,
    refresh: invalidate,
  };
}
