"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeNotesService } from "@/lib/services/employee-notes.service";

/** HR notes for an employee: list + add + delete. */
export function useEmployeeNotes(employeeId: string | null) {
  const queryClient = useQueryClient();
  const key = ["employee-notes", employeeId];

  const listQuery = useQuery({
    queryKey: key,
    queryFn: () => employeeNotesService.list(employeeId!),
    enabled: !!employeeId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const addMutation = useMutation({
    mutationFn: (body: string) =>
      employeeNotesService.add(employeeId!, body),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => employeeNotesService.remove(id),
    onSuccess: invalidate,
  });

  return {
    notes: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: listQuery.error,
    add: addMutation.mutateAsync,
    adding: addMutation.isPending,
    remove: removeMutation.mutateAsync,
  };
}
