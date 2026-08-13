"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reconciliationService } from "@/lib/services/reconciliation.service";

/** Reconciliation report query + a mutation to re-run the health check. */
export function useReconciliation() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["finance-reconciliation"],
    queryFn: () => reconciliationService.get(),
  });

  const runMutation = useMutation({
    mutationFn: () => reconciliationService.run(),
    onSuccess: (report) => queryClient.setQueryData(["finance-reconciliation"], report),
  });

  return { report: data, isLoading, isError, runMutation };
}

/**
 * Unaccounted sales collections by supervisor, for an optional date window.
 * Kept separate from the reconciliation report so re-running the health check
 * does not refetch it, and so the date filter only invalidates this query.
 */
export function useSalesVariance(range?: {
  startDate?: string;
  endDate?: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["finance-sales-variance", range?.startDate ?? "", range?.endDate ?? ""],
    queryFn: () => reconciliationService.salesVariance(range),
  });

  return { variance: data, isLoading, isError };
}
