'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { PVQueryParams, CreatePVPayload } from '../types/finance';

export function usePaymentVouchers(params?: PVQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'payment-vouchers', params],
    queryFn: () => financeService.getPaymentVouchers(params),
  });

  const inv = () => queryClient.invalidateQueries({ queryKey: ['finance', 'payment-vouchers'] });

  const createMutation = useMutation({ mutationFn: (p: CreatePVPayload) => financeService.createPaymentVoucher(p), onSuccess: inv });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreatePVPayload> }) => financeService.updatePaymentVoucher(id, data), onSuccess: inv });
  const submitMutation = useMutation({ mutationFn: (id: string) => financeService.submitPV(id), onSuccess: inv });
  const verifyDocsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { poVerified?: boolean; grnVerified?: boolean; invoiceVerified?: boolean } }) =>
      financeService.verifyPVDocuments(id, data),
    onSuccess: inv,
  });
  const hodApproveMutation = useMutation({ mutationFn: (id: string) => financeService.hodApprovePV(id), onSuccess: inv });
  const mdApproveMutation = useMutation({ mutationFn: (id: string) => financeService.mdApprovePV(id), onSuccess: inv });
  const financeReviewMutation = useMutation({ mutationFn: (id: string) => financeService.financeReviewPV(id), onSuccess: inv });
  const processMutation = useMutation({ mutationFn: (id: string) => financeService.processPV(id), onSuccess: inv });
  const rejectMutation = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => financeService.rejectPV(id, reason), onSuccess: inv });
  const deleteMutation = useMutation({ mutationFn: (id: string) => financeService.deletePV(id), onSuccess: inv });

  return {
    vouchers: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createPV: createMutation.mutateAsync,
    updatePV: (id: string, data: Partial<CreatePVPayload>) => updateMutation.mutateAsync({ id, data }),
    submitPV: submitMutation.mutateAsync,
    verifyDocuments: (id: string, docs: { poVerified?: boolean; grnVerified?: boolean; invoiceVerified?: boolean }) =>
      verifyDocsMutation.mutateAsync({ id, data: docs }),
    hodApprovePV: hodApproveMutation.mutateAsync,
    mdApprovePV: mdApproveMutation.mutateAsync,
    financeReviewPV: financeReviewMutation.mutateAsync,
    processPV: processMutation.mutateAsync,
    rejectPV: (id: string, reason: string) => rejectMutation.mutateAsync({ id, reason }),
    deletePV: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: inv,
  };
}
