"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/lib/services/role.service";

/** All assignable roles (built-in + custom) + create/update/delete. */
export function useRoles() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["roles"] });

  const listQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { label: string; description?: string }) =>
      roleService.create(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { label?: string; description?: string };
    }) => roleService.update(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: invalidate,
  });

  return {
    roles: listQuery.data ?? [],
    loading: listQuery.isLoading,
    create: createMutation.mutateAsync,
    creating: createMutation.isPending,
    update: (id: string, payload: { label?: string; description?: string }) =>
      updateMutation.mutateAsync({ id, payload }),
    remove: deleteMutation.mutateAsync,
  };
}
