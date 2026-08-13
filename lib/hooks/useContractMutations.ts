'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/lib/services/contract.service';
import type {
  CreateContractPayload,
  RenewContractPayload,
  TerminateContractPayload,
} from '@/lib/types/contract';

/**
 * Write-side mutations for employment contracts (create / renew / terminate).
 * Invalidates the shared `['contracts']` query tree so list, stats and detail
 * views refetch after a successful write.
 */
export function useContractMutations() {
  const queryClient = useQueryClient();
  const inv = () => queryClient.invalidateQueries({ queryKey: ['contracts'] });

  const createMutation = useMutation({
    mutationFn: (data: CreateContractPayload) => contractService.create(data),
    onSuccess: inv,
  });

  const renewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RenewContractPayload }) => contractService.renew(id, data),
    onSuccess: inv,
  });

  const terminateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TerminateContractPayload }) => contractService.terminate(id, data),
    onSuccess: inv,
  });

  return {
    createContract: createMutation.mutateAsync,
    creating: createMutation.isPending,
    renewContract: (id: string, data: RenewContractPayload) => renewMutation.mutateAsync({ id, data }),
    renewing: renewMutation.isPending,
    terminateContract: (id: string, data: TerminateContractPayload) => terminateMutation.mutateAsync({ id, data }),
    terminating: terminateMutation.isPending,
  };
}
