'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsService } from '../services/operations.service';
import type {
  AssetAssignmentQueryParams,
  CreateAssetAssignmentPayload,
  ReturnAssetPayload,
  AssetRequestQueryParams,
  CreateAssetRequestPayload,
  FulfillRequestPayload,
} from '../types/operations';

export function useAssetAssignments(params?: AssetAssignmentQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operations', 'asset-assignments', params],
    queryFn: () => operationsService.getAssignments(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAssetAssignmentPayload) => operationsService.createAssignment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-assignments'] }),
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnAssetPayload }) => operationsService.returnAsset(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-assignments'] }),
  });

  const signMutation = useMutation({
    mutationFn: ({ id, signedBy, comments }: { id: string; signedBy: string; comments?: string }) => operationsService.signAssetRegister(id, signedBy, comments),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-assignments'] }),
  });

  const disputeMutation = useMutation({
    mutationFn: ({ id, signedBy, comments }: { id: string; signedBy: string; comments: string }) => operationsService.disputeAssetRegister(id, signedBy, comments),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-assignments'] }),
  });

  return {
    assignments: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createAssignment: createMutation.mutateAsync,
    returnAsset: (id: string, payload: ReturnAssetPayload) => returnMutation.mutateAsync({ id, data: payload }),
    signAssignment: (id: string, signedBy: string, comments?: string) => signMutation.mutateAsync({ id, signedBy, comments }),
    disputeAssignment: (id: string, signedBy: string, comments: string) => disputeMutation.mutateAsync({ id, signedBy, comments }),
    creating: createMutation.isPending,
    returning: returnMutation.isPending,
    signing: signMutation.isPending,
    disputing: disputeMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-assignments'] }),
  };
}

export function useAssetRequests(params?: AssetRequestQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operations', 'asset-requests', params],
    queryFn: () => operationsService.getRequests(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAssetRequestPayload) => operationsService.createRequest(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-requests'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) => operationsService.approveRequest(id, approvedBy),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-requests'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => operationsService.rejectRequest(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-requests'] }),
  });

  const fulfillMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FulfillRequestPayload }) => operationsService.fulfillRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'asset-requests'] });
      // A handover also creates an assignment + flips the asset's holder.
      queryClient.invalidateQueries({ queryKey: ['operations', 'asset-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'fixed-assets'] });
    },
  });

  return {
    requests: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createRequest: createMutation.mutateAsync,
    approveRequest: (id: string, approvedBy: string) => approveMutation.mutateAsync({ id, approvedBy }),
    rejectRequest: (id: string, reason: string) => rejectMutation.mutateAsync({ id, reason }),
    fulfillRequest: (id: string, payload: FulfillRequestPayload) => fulfillMutation.mutateAsync({ id, payload }),
    creating: createMutation.isPending,
    approving: approveMutation.isPending,
    rejecting: rejectMutation.isPending,
    fulfilling: fulfillMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['operations', 'asset-requests'] }),
  };
}
