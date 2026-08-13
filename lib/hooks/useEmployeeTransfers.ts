"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeTransferService } from "@/lib/services/employee-transfer.service";
import { employeeService } from "@/lib/services/employee.service";
import { departmentService } from "@/lib/services/department.service";
import type {
  CreateEmployeeTransferPayload,
  EmployeeTransferQueryParams,
} from "@/lib/types/employee-transfer";

/** Transfers list + create/approve/reject/cancel + employee & department pickers. */
export function useEmployeeTransfers(params?: EmployeeTransferQueryParams) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["employee-transfers"] });

  const transfers = useQuery({
    queryKey: ["employee-transfers", params ?? {}],
    queryFn: () => employeeTransferService.getAll(params),
  });

  const employees = useQuery({
    queryKey: ["employee-transfers", "employee-picker"],
    queryFn: () => employeeService.getAll({ limit: 200 }),
  });

  const departments = useQuery({
    queryKey: ["employee-transfers", "department-picker"],
    queryFn: () => departmentService.getAll({ limit: 100 }),
  });

  const create = useMutation({
    mutationFn: (data: CreateEmployeeTransferPayload) => employeeTransferService.create(data),
    onSuccess: invalidate,
  });
  const approve = useMutation({
    mutationFn: (id: string) => employeeTransferService.approve(id),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (id: string) => employeeTransferService.reject(id),
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: (id: string) => employeeTransferService.cancel(id),
    onSuccess: invalidate,
  });

  return { transfers, employees, departments, create, approve, reject, cancel };
}
