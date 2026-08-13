"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { travelService } from "@/lib/services/travel.service";
import type {
  CreatePerDiemRatePayload,
  UpdatePerDiemRatePayload,
} from "@/lib/types/travel";

/**
 * Per-diem rates. `all` true → admin list (includes inactive) with mutations;
 * default → active rates only (for the request form).
 */
export function usePerDiemRates(opts?: { all?: boolean }) {
  const queryClient = useQueryClient();
  const all = opts?.all ?? false;
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["per-diem-rates"] });

  const listQuery = useQuery({
    queryKey: ["per-diem-rates", all],
    queryFn: () => travelService.listRates({ all }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePerDiemRatePayload) =>
      travelService.createRate(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePerDiemRatePayload;
    }) => travelService.updateRate(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => travelService.deleteRate(id),
    onSuccess: invalidate,
  });

  return {
    rates: listQuery.data ?? [],
    loading: listQuery.isLoading,
    create: createMutation.mutateAsync,
    creating: createMutation.isPending,
    update: (id: string, payload: UpdatePerDiemRatePayload) =>
      updateMutation.mutateAsync({ id, payload }),
    updating: updateMutation.isPending,
    remove: deleteMutation.mutateAsync,
  };
}
