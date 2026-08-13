import { apiClient } from '../api/client';
import type {
  StoreItem,
  StoreItemsPage,
  StoreItemQueryParams,
  CreateStoreItemPayload,
  UpdateStoreItemPayload,
  ReceiveStorePayload,
  IssueStorePayload,
  AdjustStorePayload,
  StoreMovement,
  StoreValuation,
} from '../types/stores';

const PATH = '/operations/stores';

export const storesService = {
  getItems(params?: StoreItemQueryParams): Promise<StoreItemsPage> {
    return apiClient.get<StoreItemsPage>(`${PATH}/items`, params as Record<string, string | number | boolean | undefined>);
  },
  getValuation(): Promise<StoreValuation> {
    return apiClient.get<StoreValuation>(`${PATH}/valuation`);
  },
  getMovements(id: string): Promise<StoreMovement[]> {
    return apiClient.get<StoreMovement[]>(`${PATH}/items/${id}/movements`);
  },
  createItem(data: CreateStoreItemPayload): Promise<StoreItem> {
    return apiClient.post<StoreItem>(`${PATH}/items`, data);
  },
  updateItem(id: string, data: UpdateStoreItemPayload): Promise<StoreItem> {
    return apiClient.patch<StoreItem>(`${PATH}/items/${id}`, data);
  },
  deleteItem(id: string): Promise<{ success: true }> {
    return apiClient.delete<{ success: true }>(`${PATH}/items/${id}`);
  },
  receive(id: string, data: ReceiveStorePayload): Promise<StoreItem> {
    return apiClient.post<StoreItem>(`${PATH}/items/${id}/receive`, data);
  },
  issue(id: string, data: IssueStorePayload): Promise<StoreItem> {
    return apiClient.post<StoreItem>(`${PATH}/items/${id}/issue`, data);
  },
  adjust(id: string, data: AdjustStorePayload): Promise<StoreItem> {
    return apiClient.post<StoreItem>(`${PATH}/items/${id}/adjust`, data);
  },
};
