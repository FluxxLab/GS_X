'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { ContractQueryParams, CreateContractPayload } from '../types/finance';

export function useContracts(params?: ContractQueryParams) {
  const queryClient = useQueryClient();
  const KEY = ['finance', 'procurement-contracts'];

  const { data, isLoading } = useQuery({
    queryKey: [...KEY, params],
    queryFn: () => financeService.getContracts(params),
  });

  const inv = () => queryClient.invalidateQueries({ queryKey: KEY });

  const createMutation = useMutation({ mutationFn: (p: CreateContractPayload) => financeService.createContract(p), onSuccess: inv });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreateContractPayload> }) => financeService.updateContract(id, data), onSuccess: inv });
  const deleteMutation = useMutation({ mutationFn: (id: string) => financeService.deleteContract(id), onSuccess: inv });
  const submitMutation = useMutation({ mutationFn: (id: string) => financeService.submitContract(id), onSuccess: inv });
  const legalApproveMutation = useMutation({ mutationFn: (id: string) => financeService.legalApproveContract(id), onSuccess: inv });
  const financeApproveMutation = useMutation({ mutationFn: (id: string) => financeService.financeApproveContract(id), onSuccess: inv });
  const mdApproveMutation = useMutation({ mutationFn: (id: string) => financeService.mdApproveContract(id), onSuccess: inv });
  const sendToVendorMutation = useMutation({ mutationFn: (id: string) => financeService.sendContractToVendor(id), onSuccess: inv });
  const activateMutation = useMutation({ mutationFn: ({ id, signedDate }: { id: string; signedDate: string }) => financeService.activateContract(id, signedDate), onSuccess: inv });
  const terminateMutation = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => financeService.terminateContract(id, reason), onSuccess: inv });
  const renewMutation = useMutation({ mutationFn: (id: string) => financeService.renewContract(id), onSuccess: inv });
  const rejectMutation = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => financeService.rejectContract(id, reason), onSuccess: inv });

  return {
    contracts: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createContract: createMutation.mutateAsync,
    updateContract: (id: string, payload: Partial<CreateContractPayload>) => updateMutation.mutateAsync({ id, data: payload }),
    deleteContract: deleteMutation.mutateAsync,
    submitContract: submitMutation.mutateAsync,
    legalApproveContract: legalApproveMutation.mutateAsync,
    financeApproveContract: financeApproveMutation.mutateAsync,
    mdApproveContract: mdApproveMutation.mutateAsync,
    sendToVendor: sendToVendorMutation.mutateAsync,
    activateContract: (id: string, signedDate: string) => activateMutation.mutateAsync({ id, signedDate }),
    terminateContract: (id: string, reason: string) => terminateMutation.mutateAsync({ id, reason }),
    renewContract: renewMutation.mutateAsync,
    rejectContract: (id: string, reason: string) => rejectMutation.mutateAsync({ id, reason }),
    downloadPdf: financeService.downloadContractPdf,
    creating: createMutation.isPending,
    refresh: inv,
  };
}
