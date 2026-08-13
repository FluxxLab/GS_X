import { apiClient } from '../api/client';
import type {
  Promotion, PromotionStats, CreatePromotionPayload, PromotionQueryParams, PaginatedResponse,
} from '../types/promotion';

const PATH = '/promotions';

export const promotionService = {
  create(data: CreatePromotionPayload): Promise<Promotion> {
    return apiClient.post<Promotion>(PATH, data);
  },

  getAll(params?: PromotionQueryParams): Promise<PaginatedResponse<Promotion>> {
    return apiClient.get<PaginatedResponse<Promotion>>(PATH, params as Record<string, string | number | boolean | undefined>);
  },

  getById(id: string): Promise<Promotion> {
    return apiClient.get<Promotion>(`${PATH}/${id}`);
  },

  getStats(): Promise<PromotionStats> {
    return apiClient.get<PromotionStats>(`${PATH}/stats`);
  },

  approve(id: string): Promise<Promotion> {
    return apiClient.patch<Promotion>(`${PATH}/${id}/approve`);
  },

  reject(id: string, reason?: string): Promise<Promotion> {
    return apiClient.patch<Promotion>(`${PATH}/${id}/reject`, { reason });
  },

  implement(id: string): Promise<Promotion> {
    return apiClient.patch<Promotion>(`${PATH}/${id}/implement`);
  },
};
