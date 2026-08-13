import { apiClient } from "../api/client";

export interface AuditLog {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogPage {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditQueryParams {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export const auditService = {
  list(params?: AuditQueryParams): Promise<AuditLogPage> {
    return apiClient.get<AuditLogPage>(
      "/audit-logs",
      params as Record<string, string | number | boolean | undefined>,
    );
  },
  forEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>(`/audit-logs/entity/${entityType}/${entityId}`);
  },
};
