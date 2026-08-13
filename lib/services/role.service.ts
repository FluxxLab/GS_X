import { apiClient } from "../api/client";

export interface Role {
  id: string;
  key: string;
  label: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

const PATH = "/settings/roles";

export const roleService = {
  list(): Promise<Role[]> {
    return apiClient.get<Role[]>(PATH);
  },
  create(payload: { label: string; description?: string }): Promise<Role> {
    return apiClient.post<Role>(PATH, payload);
  },
  update(
    id: string,
    payload: { label?: string; description?: string },
  ): Promise<Role> {
    return apiClient.patch<Role>(`${PATH}/${id}`, payload);
  },
  remove(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`${PATH}/${id}`);
  },
};
