'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { PurchaseOrderQueryParams, CreatePurchaseOrderPayload, UpdatePurchaseOrderPayload } from '../types/finance';

export function usePurchaseOrders(params?: PurchaseOrderQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'purchase-orders', params],
    queryFn: () => financeService.getPurchaseOrders(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) => financeService.createPurchaseOrder(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-orders'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseOrderPayload }) => financeService.updatePurchaseOrder(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-orders'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deletePurchaseOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-orders'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => financeService.approvePurchaseOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-orders'] }),
  });

  return {
    purchaseOrders: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createPurchaseOrder: createMutation.mutateAsync,
    updatePurchaseOrder: (id: string, payload: UpdatePurchaseOrderPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deletePurchaseOrder: deleteMutation.mutateAsync,
    approvePurchaseOrder: approveMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'purchase-orders'] }),
  };
}
