"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollService } from "@/lib/services/payroll.service";
import { employeeService } from "@/lib/services/employee.service";
import type {
  CreatePayrollAdjustmentPayload,
  PayrollAdjustmentQueryParams,
} from "@/lib/types/payroll";

/** Back-pay / bonus / deduction adjustments for a period + employee picker. */
export function usePayrollAdjustments(params: PayrollAdjustmentQueryParams) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["payroll", "adjustments"] });

  const adjustments = useQuery({
    queryKey: ["payroll", "adjustments", params],
    queryFn: () => payrollService.getAdjustments(params),
  });

  const employees = useQuery({
    queryKey: ["payroll", "adjustments", "employee-picker"],
    queryFn: () => employeeService.getAll({ limit: 200 }),
  });

  const create = useMutation({
    mutationFn: (data: CreatePayrollAdjustmentPayload) => payrollService.createAdjustment(data),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => payrollService.cancelAdjustment(id),
    onSuccess: invalidate,
  });

  return { adjustments, employees, create, cancel };
}
