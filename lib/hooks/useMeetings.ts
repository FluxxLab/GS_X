"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingsService } from "@/lib/services/meetings.service";
import type { CreateMeetingPayload } from "@/lib/types/meetings";

/** My meetings (hosted or invited) — or meetings linked to a record — plus schedule/cancel. */
export function useMeetings(filter?: { linkedType?: string; linkedId?: string }) {
  const queryClient = useQueryClient();
  const key = ["meetings", filter?.linkedType ?? null, filter?.linkedId ?? null];

  const listQuery = useQuery({
    queryKey: key,
    queryFn: () => meetingsService.list(filter),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["meetings"] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateMeetingPayload) =>
      meetingsService.create(payload),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => meetingsService.cancel(id),
    onSuccess: invalidate,
  });

  return {
    meetings: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: listQuery.error,
    create: createMutation.mutateAsync,
    creating: createMutation.isPending,
    cancel: cancelMutation.mutateAsync,
    cancelling: cancelMutation.isPending,
  };
}
