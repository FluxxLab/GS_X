export interface Lookup {
  id: string;
  category: string;
  value: string;
  label: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface CreateLookupPayload {
  category: string;
  value: string;
  label: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export type UpdateLookupPayload = Partial<CreateLookupPayload>;
