"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operationsService } from "../services/operations.service";
import type {
  WorkOrderQueryParams,
  CreateWorkOrderPayload,
  UpdateWorkOrderPayload,
  CompleteWorkOrderPayload,
  RaiseWorkOrderPayload,
  ApproveWorkOrderPayload,
  RejectWorkOrderPayload,
} from "../types/operations";

export function useWorkOrders(params?: WorkOrderQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["operations", "work-orders", params],
    queryFn: () => operationsService.getWorkOrders(params),
  });

  const invalidateWorkAndAssets = () => {
    queryClient.invalidateQueries({ queryKey: ["operations", "work-orders"] });
    // A work order can move its asset in/out of UNDER_MAINTENANCE.
    queryClient.invalidateQueries({ queryKey: ["finance", "fixed-assets"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateWorkOrderPayload) =>
      operationsService.createWorkOrder(payload),
    onSuccess: invalidateWorkAndAssets,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkOrderPayload }) =>
      operationsService.updateWorkOrder(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["operations", "work-orders"],
      }),
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => operationsService.startWorkOrder(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["operations", "work-orders"],
      }),
  });

  const completeMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CompleteWorkOrderPayload;
    }) => operationsService.completeWorkOrder(id, data),
    onSuccess: invalidateWorkAndAssets,
  });

  const raiseMutation = useMutation({
    mutationFn: (payload: RaiseWorkOrderPayload) =>
      operationsService.raiseWorkOrder(payload),
    onSuccess: invalidateWorkAndAssets,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveWorkOrderPayload }) =>
      operationsService.approveWorkOrder(id, data),
    onSuccess: invalidateWorkAndAssets,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectWorkOrderPayload }) =>
      operationsService.rejectWorkOrder(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["operations", "work-orders"],
      }),
  });

  return {
    workOrders: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createWorkOrder: createMutation.mutateAsync,
    updateWorkOrder: (id: string, payload: UpdateWorkOrderPayload) =>
      updateMutation.mutateAsync({ id, data: payload }),
    startWorkOrder: startMutation.mutateAsync,
    completeWorkOrder: (id: string, payload: CompleteWorkOrderPayload) =>
      completeMutation.mutateAsync({ id, data: payload }),
    completing: completeMutation.isPending,
    raiseWorkOrder: raiseMutation.mutateAsync,
    raising: raiseMutation.isPending,
    approveWorkOrder: (id: string, payload: ApproveWorkOrderPayload) =>
      approveMutation.mutateAsync({ id, data: payload }),
    rejectWorkOrder: (id: string, payload: RejectWorkOrderPayload) =>
      rejectMutation.mutateAsync({ id, data: payload }),
    approving: approveMutation.isPending,
    rejecting: rejectMutation.isPending,
    creating: createMutation.isPending,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: ["operations", "work-orders"],
      }),
  };
}
