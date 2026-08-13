import type { UserRole } from './user';

export type PermissionAction = 'view' | 'create' | 'approve' | 'delete';

export interface CatalogModule {
  key: string; // e.g. 'finance.expenses'
  label: string; // 'Expenses'
  group: string; // 'Finance'
  actions: PermissionAction[];
}

/** role → granted permission keys */
export type PermissionMatrix = Record<UserRole, string[]>;

export interface MyPermissions {
  role: UserRole;
  permissions: string[];
}
