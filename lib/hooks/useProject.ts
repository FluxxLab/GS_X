"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operationsService } from "@/lib/services/operations.service";
import type { UpdateProjectPayload } from "@/lib/types/operations";

/** One project's detail + edit + task mutations. */
export function useProject(id: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["project", id] });

  const project = useQuery({
    queryKey: ["project", id],
    queryFn: () => operationsService.getProject(id),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (data: UpdateProjectPayload) => operationsService.updateProject(id, data),
    onSuccess: invalidate,
  });
  const addTask = useMutation({
    mutationFn: (data: { title: string; description?: string; assigneeId?: string; dueDate?: string }) =>
      operationsService.addProjectTask(id, data),
    onSuccess: invalidate,
  });
  const updateTask = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: { status?: string; title?: string } }) =>
      operationsService.updateProjectTask(id, taskId, data),
    onSuccess: invalidate,
  });
  const deleteTask = useMutation({
    mutationFn: (taskId: string) => operationsService.deleteProjectTask(id, taskId),
    onSuccess: invalidate,
  });

  return { project, update, addTask, updateTask, deleteTask };
}
