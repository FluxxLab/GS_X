import { apiClient } from '../api/client';
import type { CatalogModule, PermissionMatrix, MyPermissions } from '../types/permissions';
import type { UserRole } from '../types/user';

const PATH = '/settings/permissions';

export const permissionsService = {
  getCatalog(): Promise<CatalogModule[]> {
    return apiClient.get<CatalogModule[]>(`${PATH}/catalog`);
  },
  getMatrix(): Promise<PermissionMatrix> {
    return apiClient.get<PermissionMatrix>(`${PATH}/matrix`);
  },
  setRolePermissions(role: UserRole, permissions: string[]): Promise<string[]> {
    return apiClient.put<string[]>(`${PATH}/${role}`, { permissions });
  },
  getMine(): Promise<MyPermissions> {
    return apiClient.get<MyPermissions>(`${PATH}/me`);
  },
};
