'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { separationService } from '../services/separation.service';
import type { SeparationQueryParams, CreateSeparationPayload } from '../types/separation';

export function useSeparations(params?: SeparationQueryParams) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['separations', params],
    queryFn: () => separationService.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSeparationPayload) => separationService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['separations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => separationService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['separations'] }),
  });

  return {
    separations: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createSeparation: createMutation.mutateAsync,
    creating: createMutation.isPending,
    deleteSeparation: deleteMutation.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: ['separations'] }),
  };
}
