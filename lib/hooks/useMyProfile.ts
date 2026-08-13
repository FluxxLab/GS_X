"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/lib/services/employee.service";
import { attendanceService } from "@/lib/services/attendance.service";
import type { SelfProfilePayload } from "@/lib/types/employee";

/** The signed-in employee's own profile + a mutation to update contact details. */
export function useMyProfile() {
  const qc = useQueryClient();

  const profile = useQuery({
    queryKey: ["me", "profile"],
    queryFn: () => employeeService.getMe(),
  });

  const leaveBalance = useQuery({
    queryKey: ["me", "leave-balance"],
    queryFn: () => attendanceService.getMyLeaveBalance(),
  });

  const update = useMutation({
    mutationFn: (data: SelfProfilePayload) => employeeService.updateMe(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "profile"] }),
  });

  return { profile, leaveBalance, update };
}

/** The signed-in employee's own attendance log within an optional date range. */
export function useMyAttendance(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ["me", "attendance", dateFrom ?? null, dateTo ?? null],
    queryFn: () => attendanceService.getMyAttendance(dateFrom, dateTo),
  });
}
