export type StoreItemCategory =
  | "STATIONERY" | "CLEANING" | "PPE" | "SAFETY" | "SPARE_PART" | "TOOLS" | "CONSUMABLE" | "OTHER";

export type StoreMovementType =
  | "OPENING_BALANCE" | "RECEIPT_IN" | "ISSUE_OUT" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT";

export interface StoreItem {
  id: string;
  code: string;
  name: string;
  category: StoreItemCategory;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  location: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreMovement {
  id: string;
  itemId: string;
  movementType: StoreMovementType;
  quantity: number;
  balanceAfter: number;
  date: string;
  issuedTo: string | null;
  recordedBy: string;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface StoreItemsPage {
  data: StoreItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StoreValuationRow {
  id: string; code: string; name: string; category: StoreItemCategory; unit: string;
  currentStock: number; reorderLevel: number; unitValue: number;
  totalValue: number; lowStock: boolean; costMissing: boolean;
}
export interface StoreValuation {
  items: StoreValuationRow[];
  lowStock: StoreValuationRow[];
  summary: { totalValue: number; itemCount: number; lowStockCount: number };
}

export interface StoreItemQueryParams {
  page?: number; limit?: number; search?: string; category?: StoreItemCategory; lowStock?: boolean;
}
export interface CreateStoreItemPayload {
  code?: string; name: string; category: StoreItemCategory; unit?: string;
  currentStock?: number; reorderLevel?: number; unitCost?: number; location?: string; description?: string;
}
export type UpdateStoreItemPayload = Partial<Omit<CreateStoreItemPayload, "currentStock">>;
export interface ReceiveStorePayload { quantity: number; unitCost?: number; date?: string; reference?: string; notes?: string }
export interface IssueStorePayload { quantity: number; issuedTo: string; date?: string; notes?: string }
export interface AdjustStorePayload { direction: "IN" | "OUT"; quantity: number; reason: string; date?: string }
