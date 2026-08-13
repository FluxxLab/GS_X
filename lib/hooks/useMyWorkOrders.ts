"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operationsService } from "../services/operations.service";
import type { RaiseWorkOrderPayload } from "../types/operations";

/** My Workspace: the current user's raised work-order requests + the raise action. */
export function useMyWorkOrders() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["operations", "my-work-orders"],
    queryFn: () => operationsService.getMyWorkOrders(),
  });

  const raiseMutation = useMutation({
    mutationFn: (payload: RaiseWorkOrderPayload) =>
      operationsService.raiseWorkOrder(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["operations", "my-work-orders"],
      }),
  });

  return {
    workOrders: data ?? [],
    loading: isLoading,
    raiseWorkOrder: raiseMutation.mutateAsync,
    raising: raiseMutation.isPending,
  };
}
