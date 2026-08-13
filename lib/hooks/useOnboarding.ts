'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService } from '../services/onboarding.service';
import type { OnboardingQueryParams } from '../types/onboarding';

const DEFAULT_QUERY: OnboardingQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export function useOnboardingList(initialQuery?: Partial<OnboardingQueryParams>) {
  const queryClient = useQueryClient();
  const [query, setQueryState] = useState<OnboardingQueryParams>({ ...DEFAULT_QUERY, ...initialQuery });

  const setQuery = useCallback((params: Partial<OnboardingQueryParams>) => {
    setQueryState((prev) => ({ ...prev, ...params }));
  }, []);

  const {
    data: listData,
    isLoading: loadingList,
    error: listError,
  } = useQuery({
    queryKey: ['onboarding', query],
    queryFn: () => onboardingService.getAll(query),
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['onboarding', 'stats'],
    queryFn: () => onboardingService.getStats(),
  });

  return {
    onboardings: listData?.data ?? [],
    stats: stats ?? null,
    pagination: {
      total: listData?.total ?? 0,
      page: listData?.page ?? 1,
      limit: listData?.limit ?? 10,
      totalPages: listData?.totalPages ?? 0,
    },
    loading: loadingList || loadingStats,
    error: listError?.message ?? null,
    query,
    setQuery,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
  };
}

export function useOnboardingDetail(id: string) {
  const queryClient = useQueryClient();

  const {
    data: onboarding,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['onboarding', id],
    queryFn: () => onboardingService.getById(id),
    enabled: !!id,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['onboarding', id] });
    queryClient.invalidateQueries({ queryKey: ['onboarding', 'stats'] });
  };

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: { isCompleted: boolean; notes?: string; completedBy?: string; assetId?: string } }) =>
      onboardingService.updateItem(itemId, data),
    onSuccess: invalidateAll,
  });

  const completeMutation = useMutation({
    mutationFn: (notes?: string) => onboardingService.complete(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      onboardingService.uploadDocument(itemId, file),
    onSuccess: invalidateAll,
  });

  const updateEmployeeDetailsMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      onboardingService.updateEmployeeDetails(id, data),
    onSuccess: invalidateAll,
  });

  const generateEmailMutation = useMutation({
    mutationFn: (emailPrefix: string) =>
      onboardingService.generateEmail(id, emailPrefix),
    onSuccess: invalidateAll,
  });

  const createErpAccountMutation = useMutation({
    mutationFn: () => onboardingService.createErpAccount(id),
    onSuccess: invalidateAll,
  });

  return {
    onboarding: onboarding ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    updateItem: (itemId: string, data: { isCompleted: boolean; notes?: string; completedBy?: string; assetId?: string }) =>
      updateItemMutation.mutateAsync({ itemId, data }),
    updatingItem: updateItemMutation.isPending,
    completeOnboarding: (notes?: string) => completeMutation.mutateAsync(notes),
    completing: completeMutation.isPending,
    uploadDocument: (itemId: string, file: File) =>
      uploadDocumentMutation.mutateAsync({ itemId, file }),
    uploadingDocument: uploadDocumentMutation.isPending,
    updateEmployeeDetails: (data: Record<string, unknown>) =>
      updateEmployeeDetailsMutation.mutateAsync(data),
    updatingDetails: updateEmployeeDetailsMutation.isPending,
    generateEmail: (emailPrefix: string) =>
      generateEmailMutation.mutateAsync(emailPrefix),
    generatingEmail: generateEmailMutation.isPending,
    createErpAccount: () => createErpAccountMutation.mutateAsync(),
    creatingAccount: createErpAccountMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['onboarding', id] }),
  };
}
