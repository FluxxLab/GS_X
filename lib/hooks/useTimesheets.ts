"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timesheetService } from "@/lib/services/timesheet.service";
import type {
  SubmitTimesheetPayload,
  TimesheetQueryParams,
} from "@/lib/types/timesheet";

/** Self-service: my timesheets + submit. */
export function useMyTimesheets() {
  const qc = useQueryClient();
  const timesheets = useQuery({
    queryKey: ["timesheets", "mine"],
    queryFn: () => timesheetService.getMine(),
  });
  const submit = useMutation({
    mutationFn: (data: SubmitTimesheetPayload) => timesheetService.submitMine(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timesheets", "mine"] }),
  });
  return { timesheets, submit };
}

/** Admin/manager: list + approve/reject. */
export function useTimesheets(params?: TimesheetQueryParams) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["timesheets", "all"] });

  const timesheets = useQuery({
    queryKey: ["timesheets", "all", params ?? {}],
    queryFn: () => timesheetService.getAll(params),
  });
  const approve = useMutation({
    mutationFn: (id: string) => timesheetService.approve(id),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (id: string) => timesheetService.reject(id),
    onSuccess: invalidate,
  });
  return { timesheets, approve, reject };
}
