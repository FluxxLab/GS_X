import { apiClient } from '../api/client';
import type {
  Employee,
  EmployeeDocument,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeQueryParams,
  PaginatedResponse,
  EmployeeStats,
  SelfProfilePayload,
} from '../types/employee';

const PATH = '/employees';

export const employeeService = {
  getAll(params?: EmployeeQueryParams): Promise<PaginatedResponse<Employee>> {
    return apiClient.get<PaginatedResponse<Employee>>(PATH, params as Record<string, string | number | boolean | undefined>);
  },

  getById(id: string): Promise<Employee> {
    return apiClient.get<Employee>(`${PATH}/${id}`);
  },

  getStats(): Promise<EmployeeStats> {
    return apiClient.get<EmployeeStats>(`${PATH}/stats`);
  },

  /** Profile photo bytes; rejects (404) when the employee has none. */
  getAvatarBlob(id: string): Promise<Blob> {
    return apiClient.getBlob(`${PATH}/${id}/avatar`);
  },

  // ─── Self-service ─────────────────────────────────────────────────────────────

  getMe(): Promise<Employee> {
    return apiClient.get<Employee>(`${PATH}/me`);
  },

  updateMe(data: SelfProfilePayload): Promise<Employee> {
    return apiClient.patch<Employee>(`${PATH}/me`, data);
  },

  create(data: CreateEmployeePayload): Promise<Employee> {
    return apiClient.post<Employee>(PATH, data);
  },

  update(id: string, data: UpdateEmployeePayload): Promise<Employee> {
    return apiClient.patch<Employee>(`${PATH}/${id}`, data);
  },

  deactivate(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/${id}`);
  },

  // ─── Documents ──────────────────────────────────────────────────────────────

  getDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    return apiClient.get<EmployeeDocument[]>(`${PATH}/${employeeId}/documents`);
  },

  /** Multipart upload — the file goes to S3, not through the JSON body. */
  addDocument(
    employeeId: string,
    file: File,
    meta?: { name?: string; type?: string; notes?: string },
  ): Promise<EmployeeDocument> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", meta?.name ?? file.name);
    formData.append("type", meta?.type ?? "other");
    if (meta?.notes) formData.append("notes", meta.notes);
    return apiClient.upload<EmployeeDocument>(`${PATH}/${employeeId}/documents`, formData);
  },

  /** Short-lived signed URL; falls back to a data URL for un-migrated rows. */
  documentDownloadUrl(docId: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`${PATH}/documents/${docId}/download`);
  },

  removeDocument(docId: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/documents/${docId}`);
  },

  /** Backfill legacy base64 rows into S3. Re-run until `remaining` is 0. */
  migrateDocumentsToS3(limit = 50): Promise<{ migrated: number; failed: number; remaining: number }> {
    return apiClient.post<{ migrated: number; failed: number; remaining: number }>(
      `${PATH}/documents/migrate-to-s3?limit=${limit}`,
      {},
    );
  },
};
