'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '@/lib/services/payroll.service';
import type { CreateTaxFilingPayload, TaxFilingQueryParams } from '@/lib/types/payroll';

interface Options {
  onCreateSuccess: () => void;
  onCreateError: (message: string) => void;
  onRemitSuccess: () => void;
}

/** Tax-filings list query + create/submit/remit mutations. */
export function useTaxFilings(queryParams: TaxFilingQueryParams, { onCreateSuccess, onCreateError, onRemitSuccess }: Options) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tax-filings', queryParams],
    queryFn: () => payrollService.getTaxFilings(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaxFilingPayload) => payrollService.createTaxFiling(payload),
    onSuccess: () => { onCreateSuccess(); queryClient.invalidateQueries({ queryKey: ['tax-filings'] }); },
    onError: (err: Error) => onCreateError(err.message),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => payrollService.submitTaxFiling(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax-filings'] }),
  });

  const remitMutation = useMutation({
    mutationFn: ({ id, ref }: { id: string; ref?: string }) => payrollService.markTaxFilingRemitted(id, ref),
    onSuccess: () => { onRemitSuccess(); queryClient.invalidateQueries({ queryKey: ['tax-filings'] }); },
  });

  return {
    filings: data?.data || [],
    totalPages: data?.totalPages || 1,
    isLoading,
    createMutation,
    submitMutation,
    remitMutation,
  };
}
