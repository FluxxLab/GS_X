"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remittanceService } from "@/lib/services/remittance.service";

/** Statutory remittance status + batches for a run + a remit action. */
export function useRemittance(runId: string | null) {
  const qc = useQueryClient();

  const status = useQuery({
    queryKey: ["remittance", "status"],
    queryFn: () => remittanceService.getStatus(),
  });

  const batches = useQuery({
    queryKey: ["remittance", "run", runId],
    queryFn: () => remittanceService.listForRun(runId as string),
    enabled: !!runId,
  });

  const remit = useMutation({
    mutationFn: () => remittanceService.remit(runId as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["remittance", "run", runId] }),
  });

  return { status, batches, remit };
}
