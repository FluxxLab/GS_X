import { apiClient } from '../api/client';
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UserQueryParams,
  PaginatedResponse,
  UserStats,
  UserStatus,
} from '../types/user';

const PATH = '/users';

export const userService = {
  getAll(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>(PATH, params as Record<string, string | number | boolean | undefined>);
  },

  getById(id: string): Promise<User> {
    return apiClient.get<User>(`${PATH}/${id}`);
  },

  getStats(): Promise<UserStats> {
    return apiClient.get<UserStats>(`${PATH}/stats`);
  },

  create(data: CreateUserPayload): Promise<User> {
    return apiClient.post<User>(PATH, data);
  },

  update(id: string, data: UpdateUserPayload): Promise<User> {
    return apiClient.patch<User>(`${PATH}/${id}`, data);
  },

  // Set the account status (active/suspended/deactivated) via PATCH /users/:id.
  // The backend UpdateUserDto accepts an optional `status` field.
  setStatus(id: string, status: UserStatus): Promise<User> {
    return apiClient.patch<User>(`${PATH}/${id}`, { status });
  },

  suspend(id: string): Promise<User> {
    return this.setStatus(id, 'suspended');
  },

  deactivate(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/${id}`);
  },

  // ── My handwritten signature (embedded in letters I sign) ──────────

  uploadSignature(file: File): Promise<{ uploaded: boolean }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<{ uploaded: boolean }>(`${PATH}/me/signature`, formData);
  },

  getSignatureUrl(): Promise<{ url: string | null }> {
    return apiClient.get<{ url: string | null }>(`${PATH}/me/signature`);
  },

  removeSignature(): Promise<{ removed: boolean }> {
    return apiClient.delete<{ removed: boolean }>(`${PATH}/me/signature`);
  },
};
