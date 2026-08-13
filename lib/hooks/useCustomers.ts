'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { CustomerQueryParams, CreateCustomerPayload, UpdateCustomerPayload } from '../types/finance';

export function useCustomers(params?: CustomerQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'customers', params],
    queryFn: () => financeService.getCustomers(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCustomerPayload) => financeService.createCustomer(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'customers'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerPayload }) => financeService.updateCustomer(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'customers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'customers'] }),
  });

  return {
    customers: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    createCustomer: createMutation.mutateAsync,
    updateCustomer: (id: string, payload: UpdateCustomerPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deleteCustomer: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'customers'] }),
  };
}
