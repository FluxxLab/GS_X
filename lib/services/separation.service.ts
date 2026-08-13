import { apiClient } from '../api/client';
import type {
  Separation,
  SeparationQueryParams,
  PaginatedSeparations,
  CreateSeparationPayload,
  UpdateSeparationPayload,
  CreateHandoverNotePayload,
  UpdateHandoverNotePayload,
  HandoverNote,
  UpdateClearanceItemPayload,
  ClearanceItem,
  FinalSettlement,
  UpdateSettlementPayload,
  BulkSeparationPayload,
} from '../types/separation';

export const separationService = {
  // Separations
  getAll(params?: SeparationQueryParams): Promise<PaginatedSeparations> {
    return apiClient.get('/separations', params as Record<string, string>);
  },
  getOne(id: string): Promise<Separation> {
    return apiClient.get(`/separations/${id}`);
  },
  create(data: CreateSeparationPayload): Promise<Separation> {
    return apiClient.post('/separations', data);
  },
  update(id: string, data: UpdateSeparationPayload): Promise<Separation> {
    return apiClient.patch(`/separations/${id}`, data);
  },
  delete(id: string): Promise<void> {
    return apiClient.delete(`/separations/${id}`);
  },
  bulkCreate(data: BulkSeparationPayload): Promise<Separation[]> {
    return apiClient.post('/separations/bulk', data);
  },
  advance(id: string): Promise<Separation> {
    return apiClient.patch(`/separations/${id}/advance`);
  },

  // Handover Notes
  addHandoverNote(data: CreateHandoverNotePayload): Promise<HandoverNote> {
    return apiClient.post(`/separations/${data.separationId}/handover`, data);
  },
  updateHandoverNote(noteId: string, data: UpdateHandoverNotePayload): Promise<HandoverNote> {
    return apiClient.patch(`/separations/handover/${noteId}`, data);
  },
  deleteHandoverNote(noteId: string): Promise<void> {
    return apiClient.delete(`/separations/handover/${noteId}`);
  },

  // Clearance
  updateClearanceItem(itemId: string, data: UpdateClearanceItemPayload): Promise<ClearanceItem> {
    return apiClient.patch(`/separations/clearance/${itemId}`, data);
  },

  // Settlement
  getSettlement(separationId: string): Promise<FinalSettlement> {
    return apiClient.get(`/separations/${separationId}/settlement`);
  },
  updateSettlement(separationId: string, data: UpdateSettlementPayload): Promise<FinalSettlement> {
    return apiClient.patch(`/separations/${separationId}/settlement`, data);
  },
  approveSettlement(separationId: string): Promise<FinalSettlement> {
    return apiClient.patch(`/separations/${separationId}/settlement/approve`);
  },
};
