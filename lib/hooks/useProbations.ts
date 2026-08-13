"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contractService } from "@/lib/services/contract.service";

/** Contracts with a probation ending soon + confirm/extend + reminder trigger. */
export function useProbations(days = 14) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["probations-due"] });

  const probations = useQuery({
    queryKey: ["probations-due", days],
    queryFn: () => contractService.getProbationsDue(days),
  });

  const confirm = useMutation({
    mutationFn: (id: string) => contractService.confirmProbation(id),
    onSuccess: invalidate,
  });

  const extend = useMutation({
    mutationFn: ({ id, probationEndDate }: { id: string; probationEndDate: string }) =>
      contractService.extendProbation(id, { probationEndDate }),
    onSuccess: invalidate,
  });

  const runReminders = useMutation({
    mutationFn: () => contractService.runReminders(),
  });

  return { probations, confirm, extend, runReminders };
}
