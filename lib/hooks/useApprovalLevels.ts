'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { CreateApprovalLevelPayload, UpdateApprovalLevelPayload } from '../types/finance';

export function useApprovalLevels(category?: string) {
  const qc = useQueryClient();
  const key = ['settings', 'approval-levels', category];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => financeService.getApprovalLevels(category),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['settings', 'approval-levels'] });

  const createMutation = useMutation({
    mutationFn: (data: CreateApprovalLevelPayload) => financeService.createApprovalLevel(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApprovalLevelPayload }) => financeService.updateApprovalLevel(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteApprovalLevel(id),
    onSuccess: invalidate,
  });

  return {
    levels: data ?? [],
    loading: isLoading,
    createLevel: createMutation.mutateAsync,
    updateLevel: (id: string, data: UpdateApprovalLevelPayload) => updateMutation.mutateAsync({ id, data }),
    deleteLevel: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
  };
}
