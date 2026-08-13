'use client';

import { useQuery } from '@tanstack/react-query';
import { permissionsService } from '../services/permissions.service';

/** The logged-in user's effective permission keys (GET /settings/permissions/me). */
export function useMyPermissions() {
  const { data, isLoading } = useQuery({
    queryKey: ['permissions', 'me'],
    queryFn: () => permissionsService.getMine(),
    staleTime: 5 * 60 * 1000,
  });
  return {
    role: data?.role,
    permissions: data?.permissions ?? [],
    loading: isLoading,
  };
}

/**
 * Whether the current user holds a permission key, mirroring the backend
 * PermissionsGuard (Super Admin always passes). `loading` lets callers avoid
 * flashing "no access" before the permission set has arrived.
 */
export function useHasPermission(key: string): { allowed: boolean; loading: boolean } {
  const { role, permissions, loading } = useMyPermissions();
  const allowed = role === 'super_admin' || permissions.includes(key);
  return { allowed, loading };
}
