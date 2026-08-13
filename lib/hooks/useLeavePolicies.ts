"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/lib/services/attendance.service";
import type { LeaveAccrualPolicy } from "@/lib/types/attendance";

/** Leave accrual/carryover policies + a mutation to save one + carryover trigger. */
export function useLeavePolicies() {
  const qc = useQueryClient();

  const policies = useQuery({
    queryKey: ["leave-policies"],
    queryFn: () => attendanceService.getLeavePolicies(),
  });

  const save = useMutation({
    mutationFn: (policy: LeaveAccrualPolicy) => attendanceService.upsertLeavePolicy(policy),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leave-policies"] }),
  });

  const runCarryover = useMutation({
    mutationFn: (year: number) => attendanceService.processLeaveCarryover(year),
  });

  return { policies, save, runCarryover };
}
