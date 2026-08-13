"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollService } from "@/lib/services/payroll.service";
import type { UpdateSalaryStructurePayload } from "@/lib/types/payroll";

/** The tenant salary structure (earning split) + a mutation to update it. */
export function useSalaryStructure() {
  const qc = useQueryClient();

  const structure = useQuery({
    queryKey: ["payroll", "salary-structure"],
    queryFn: () => payrollService.getSalaryStructure(),
  });

  const update = useMutation({
    mutationFn: (data: UpdateSalaryStructurePayload) =>
      payrollService.updateSalaryStructure(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll", "salary-structure"] }),
  });

  return { structure, update };
}
