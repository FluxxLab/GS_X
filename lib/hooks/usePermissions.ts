'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsService } from '../services/permissions.service';
import type { UserRole } from '../types/user';
import type { CatalogModule, PermissionMatrix } from '../types/permissions';

export function usePermissions() {
  const queryClient = useQueryClient();

  const catalogQuery = useQuery({
    queryKey: ['permissions', 'catalog'],
    queryFn: () => permissionsService.getCatalog(),
  });

  const matrixQuery = useQuery({
    queryKey: ['permissions', 'matrix'],
    queryFn: () => permissionsService.getMatrix(),
  });

  const saveMutation = useMutation({
    mutationFn: ({ role, permissions }: { role: UserRole; permissions: string[] }) =>
      permissionsService.setRolePermissions(role, permissions),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'matrix'] }),
  });

  return {
    catalog: (catalogQuery.data ?? []) as CatalogModule[],
    matrix: (matrixQuery.data ?? {}) as Partial<PermissionMatrix>,
    loading: catalogQuery.isLoading || matrixQuery.isLoading,
    error: catalogQuery.error || matrixQuery.error,
    saveRole: (role: UserRole, permissions: string[]) =>
      saveMutation.mutateAsync({ role, permissions }),
    saving: saveMutation.isPending,
  };
}
