"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesService } from "../services/sales.service";
import type { CreateSalesReportPayload } from "../types/sales";

/** My Workspace: the current user's own sales reports + create/submit actions. */
export function useMySalesReports() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["sales", "my-reports"] });

  const { data, isLoading } = useQuery({
    queryKey: ["sales", "my-reports"],
    queryFn: () => salesService.getMyReports(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSalesReportPayload) =>
      salesService.createReport(payload),
    onSuccess: invalidate,
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => salesService.submitReport(id),
    onSuccess: invalidate,
  });

  return {
    reports: data ?? [],
    loading: isLoading,
    createReport: createMutation.mutateAsync,
    submitReport: submitMutation.mutateAsync,
    creating: createMutation.isPending,
    submitting: submitMutation.isPending,
  };
}
