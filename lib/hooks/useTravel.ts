"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { travelService } from "@/lib/services/travel.service";
import type {
  CreateTravelRequestPayload,
  SubmitRetirementPayload,
  BookTravelPayload,
} from "@/lib/types/travel";

/** My Workspace: my raised travel requests + raise/cancel. */
export function useMyTravel() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["travel"] });

  const listQuery = useQuery({
    queryKey: ["travel", "mine"],
    queryFn: () => travelService.mine(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTravelRequestPayload) =>
      travelService.create(payload),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => travelService.cancel(id),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateTravelRequestPayload>;
    }) => travelService.update(id, payload),
    onSuccess: invalidate,
  });

  const retireMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SubmitRetirementPayload;
    }) => travelService.retire(id, payload),
    onSuccess: invalidate,
  });

  return {
    requests: listQuery.data ?? [],
    loading: listQuery.isLoading,
    create: createMutation.mutateAsync,
    creating: createMutation.isPending,
    update: (id: string, payload: Partial<CreateTravelRequestPayload>) =>
      updateMutation.mutateAsync({ id, payload }),
    updating: updateMutation.isPending,
    cancel: cancelMutation.mutateAsync,
    cancelling: cancelMutation.isPending,
    retire: (id: string, payload: SubmitRetirementPayload) =>
      retireMutation.mutateAsync({ id, payload }),
    retiring: retireMutation.isPending,
  };
}

/** Admin/finance: all travel requests + approve/reject. */
export function useTravelRequests(params?: { status?: string }) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["travel"] });

  const listQuery = useQuery({
    queryKey: ["travel", "all", params?.status ?? null],
    queryFn: () => travelService.list({ limit: 200, status: params?.status }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => travelService.approve(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      travelService.reject(id, reason),
    onSuccess: invalidate,
  });

  const settleMutation = useMutation({
    mutationFn: (id: string) => travelService.settleRetirement(id),
    onSuccess: invalidate,
  });

  const bookMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BookTravelPayload }) =>
      travelService.book(id, payload),
    onSuccess: invalidate,
  });

  return {
    requests: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    loading: listQuery.isLoading,
    error: listQuery.error,
    approve: approveMutation.mutateAsync,
    approving: approveMutation.isPending,
    reject: (id: string, reason: string) =>
      rejectMutation.mutateAsync({ id, reason }),
    rejecting: rejectMutation.isPending,
    settle: settleMutation.mutateAsync,
    settling: settleMutation.isPending,
    book: (id: string, payload: BookTravelPayload) =>
      bookMutation.mutateAsync({ id, payload }),
    booking: bookMutation.isPending,
  };
}
