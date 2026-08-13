"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeLoanService } from "@/lib/services/employee-loan.service";
import { employeeService } from "@/lib/services/employee.service";
import type {
  CreateEmployeeLoanPayload,
  EmployeeLoanQueryParams,
} from "@/lib/types/employee-loan";

/** Admin view: staff loans list + create/approve/reject/cancel + employee picker. */
export function useEmployeeLoans(params?: EmployeeLoanQueryParams) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["employee-loans"] });

  const loans = useQuery({
    queryKey: ["employee-loans", params ?? {}],
    queryFn: () => employeeLoanService.getAll(params),
  });

  const employees = useQuery({
    queryKey: ["employee-loans", "employee-picker"],
    queryFn: () => employeeService.getAll({ limit: 200 }),
  });

  const create = useMutation({
    mutationFn: (data: CreateEmployeeLoanPayload) => employeeLoanService.create(data),
    onSuccess: invalidate,
  });
  const approve = useMutation({
    mutationFn: (id: string) => employeeLoanService.approve(id),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (id: string) => employeeLoanService.reject(id),
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: (id: string) => employeeLoanService.cancel(id),
    onSuccess: invalidate,
  });

  return { loans, employees, create, approve, reject, cancel };
}

/** Self-service: the signed-in employee's own loans. */
export function useMyLoans() {
  return useQuery({
    queryKey: ["employee-loans", "mine"],
    queryFn: () => employeeLoanService.getMine(),
  });
}
