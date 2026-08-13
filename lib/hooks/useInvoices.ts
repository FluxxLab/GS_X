'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { InvoiceQueryParams, CreateInvoicePayload, UpdateInvoicePayload } from '../types/finance';

export function useInvoices(params?: InvoiceQueryParams, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'invoices', params],
    queryFn: () => financeService.getInvoices(params),
    enabled: options?.enabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateInvoicePayload) => financeService.createInvoice(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoicePayload }) => financeService.updateInvoice(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => financeService.sendInvoice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  });

  const voidMutation = useMutation({
    mutationFn: (id: string) => financeService.voidInvoice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteInvoice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  });

  const reminderMutation = useMutation({
    mutationFn: (id: string) => financeService.sendInvoiceReminder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  });

  const writeOffMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeService.writeOffInvoice(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  });

  return {
    invoices: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createInvoice: createMutation.mutateAsync,
    updateInvoice: (id: string, payload: UpdateInvoicePayload) => updateMutation.mutateAsync({ id, data: payload }),
    sendInvoice: sendMutation.mutateAsync,
    voidInvoice: voidMutation.mutateAsync,
    deleteInvoice: deleteMutation.mutateAsync,
    sendReminder: reminderMutation.mutateAsync,
    writeOffInvoice: (id: string, reason: string) => writeOffMutation.mutateAsync({ id, reason }),
    downloadPdf: financeService.downloadInvoicePdf,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  };
}
