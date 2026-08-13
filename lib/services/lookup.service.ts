import { apiClient } from '../api/client';
import type { Lookup, CreateLookupPayload, UpdateLookupPayload } from '../types/lookup';

const PATH = '/lookups';

export const lookupService = {
  getByCategory(category: string): Promise<Lookup[]> {
    return apiClient.get<Lookup[]>(PATH, { category });
  },
  getById(id: string): Promise<Lookup> {
    return apiClient.get<Lookup>(`${PATH}/${id}`);
  },
  create(data: CreateLookupPayload): Promise<Lookup> {
    return apiClient.post<Lookup>(PATH, data);
  },
  update(id: string, data: UpdateLookupPayload): Promise<Lookup> {
    return apiClient.patch<Lookup>(`${PATH}/${id}`, data);
  },
  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/${id}`);
  },
  seed(): Promise<void> {
    return apiClient.post<void>(`${PATH}/seed`);
  },
};
