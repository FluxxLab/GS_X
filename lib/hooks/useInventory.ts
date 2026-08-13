'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturingService } from '../services/manufacturing.service';
import type {
  ProductQueryParams,
  CreateProductPayload,
  UpdateProductPayload,
  RawMaterialQueryParams,
  CreateRawMaterialPayload,
  UpdateRawMaterialPayload,
  AdjustStockPayload,
} from '../types/manufacturing';

export function useProducts(params?: ProductQueryParams, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'products'] });

  const { data, isLoading } = useQuery({
    queryKey: ['manufacturing', 'products', params],
    queryFn: () => manufacturingService.getProducts(params),
    enabled: options?.enabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => manufacturingService.createProduct(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) => manufacturingService.updateProduct(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => manufacturingService.deleteProduct(id),
    onSuccess: invalidate,
  });

  const adjustMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustStockPayload }) => manufacturingService.adjustProductStock(id, data),
    onSuccess: invalidate,
  });

  return {
    products: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createProduct: createMutation.mutateAsync,
    updateProduct: (id: string, payload: UpdateProductPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deleteProduct: deleteMutation.mutateAsync,
    adjustStock: (id: string, payload: AdjustStockPayload) => adjustMutation.mutateAsync({ id, data: payload }),
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}

export function useRawMaterials(params?: RawMaterialQueryParams, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'raw-materials'] });

  const { data, isLoading } = useQuery({
    queryKey: ['manufacturing', 'raw-materials', params],
    queryFn: () => manufacturingService.getRawMaterials(params),
    enabled: options?.enabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateRawMaterialPayload) => manufacturingService.createRawMaterial(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRawMaterialPayload }) => manufacturingService.updateRawMaterial(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => manufacturingService.deleteRawMaterial(id),
    onSuccess: invalidate,
  });

  const adjustMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustStockPayload }) => manufacturingService.adjustRawMaterialStock(id, data),
    onSuccess: invalidate,
  });

  return {
    rawMaterials: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createRawMaterial: createMutation.mutateAsync,
    updateRawMaterial: (id: string, payload: UpdateRawMaterialPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deleteRawMaterial: deleteMutation.mutateAsync,
    adjustStock: (id: string, payload: AdjustStockPayload) => adjustMutation.mutateAsync({ id, data: payload }),
    creating: createMutation.isPending,
    refresh: invalidate,
  };
}
