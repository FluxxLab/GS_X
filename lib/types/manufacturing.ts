// ─── Enums (verbatim from backend src/manufacturing/shared/enums) ────────────

export type ProductType = 'SACHET_WATER' | 'BOTTLED_WATER' | 'DISPENSER_WATER';

export type UnitOfMeasure =
  | 'BAG' | 'PACK' | 'PIECE' | 'BOTTLE' | 'CARTON' | 'ROLL' | 'UNIT' | 'LITRE' | 'KILOGRAM';

export type RawMaterialCategory =
  | 'NYLON_ROLL' | 'BOTTLE_PREFORM' | 'CAP' | 'LABEL' | 'SHRINK_WRAP' | 'CHEMICAL' | 'OTHER';

export type StockItemType = 'PRODUCT' | 'RAW_MATERIAL';

export type StockMovementType =
  | 'OPENING_BALANCE' | 'PRODUCTION_IN' | 'CONSUMPTION_OUT' | 'SALE_OUT'
  | 'DAMAGE_OUT' | 'RETURN_IN' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

export type ProductionReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type BatchStatus =
  | 'IN_PRODUCTION' | 'QC_PENDING' | 'QC_PASSED' | 'QC_FAILED' | 'RELEASED' | 'RECALLED';

export type QualityCheckResult = 'PENDING' | 'PASS' | 'FAIL';

export type QCParameterCategory = 'WATER' | 'FINISHED_PRODUCT' | 'MICROBIOLOGICAL';

export type QCParameterResult = 'PENDING' | 'PASS' | 'FAIL' | 'NA';

export type StockAdjustmentDirection = 'IN' | 'OUT';

// ─── Inventory: Product ──────────────────────────────────────────────────────

export interface Product {
  id: string;
  sku: string;
  name: string;
  type: ProductType;
  size: string | null;
  unit: UnitOfMeasure;
  itemsPerUnit: number;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  unitCost: number;
  nafdacRegNumber: string | null;
  isActive: boolean;
  description: string | null;
  /** S3 key of the public catalog image; null until one is uploaded. */
  imageKey?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  type: ProductType;
  size?: string;
  unit?: UnitOfMeasure;
  itemsPerUnit?: number;
  currentStock?: number;
  reorderLevel?: number;
  unitPrice?: number;
  unitCost?: number;
  nafdacRegNumber?: string;
  isActive?: boolean;
  description?: string;
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, 'currentStock'>>;

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  type?: ProductType;
  lowStock?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Inventory: Raw Material ─────────────────────────────────────────────────

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: RawMaterialCategory;
  unit: UnitOfMeasure;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRawMaterialPayload {
  code: string;
  name: string;
  category: RawMaterialCategory;
  unit?: UnitOfMeasure;
  currentStock?: number;
  reorderLevel?: number;
  unitCost?: number;
  isActive?: boolean;
  description?: string;
}

export type UpdateRawMaterialPayload = Partial<Omit<CreateRawMaterialPayload, 'currentStock'>>;

export interface RawMaterialQueryParams {
  page?: number;
  limit?: number;
  category?: RawMaterialCategory;
  lowStock?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Inventory: Stock Movement (immutable ledger) ────────────────────────────

export interface StockMovement {
  id: string;
  itemType: StockItemType;
  itemId: string;
  movementType: StockMovementType;
  quantity: number;
  balanceAfter: number;
  date: string;
  referenceType: string | null;
  referenceId: string | null;
  recordedBy: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdjustStockPayload {
  direction: StockAdjustmentDirection;
  quantity: number;
  date?: string;
  reason: string;
}

// ─── Production: Report + nested lines ───────────────────────────────────────

export interface ProductionLine {
  id: string;
  reportId: string;
  productId: string;
  productName: string;
  quantityProduced: number;
  openingStock: number;
  damagedUnits: number;
  closingStock: number;
  salesIssued: number;
  batchNumber: string | null;
  nafdacRegNumber: string | null;
  manufacturingDate: string | null;
  batchStatus: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterialConsumption {
  id: string;
  reportId: string;
  rawMaterialId: string;
  materialName: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface MachineDowntime {
  id: string;
  reportId: string;
  equipment: string;
  durationMinutes: number;
  cause: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionReport {
  id: string;
  reportNumber: string;
  date: string;
  status: ProductionReportStatus;
  preparedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  lines: ProductionLine[];
  materialConsumptions: RawMaterialConsumption[];
  downtimeLogs: MachineDowntime[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionLinePayload {
  productId: string;
  quantityProduced: number;
  openingStock?: number;
  damagedUnits?: number;
  salesIssued?: number;
  batchNumber?: string;
  nafdacRegNumber?: string;
  manufacturingDate?: string;
}

export interface RawMaterialConsumptionPayload {
  rawMaterialId: string;
  quantity: number;
}

export interface MachineDowntimePayload {
  equipment: string;
  durationMinutes?: number;
  cause?: string;
}

export interface CreateProductionReportPayload {
  date: string;
  lines: ProductionLinePayload[];
  materialConsumptions?: RawMaterialConsumptionPayload[];
  downtimeLogs?: MachineDowntimePayload[];
  notes?: string;
}

export type UpdateProductionReportPayload = Partial<CreateProductionReportPayload>;

export interface ProductionReportQueryParams {
  page?: number;
  limit?: number;
  status?: ProductionReportStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Quality Control ─────────────────────────────────────────────────────────

export interface QCParameter {
  category: QCParameterCategory;
  name: string;
  result: QCParameterResult;
  value?: string | null;
  remark?: string | null;
}

export interface QualityCheck {
  id: string;
  checkNumber: string;
  productionLineId: string;
  batchNumber: string | null;
  productId: string;
  productName: string;
  checkDate: string;
  inspectedBy: string;
  result: QualityCheckResult;
  parameters: QCParameter[];
  microbiologicalLab: string | null;
  microbiologicalResult: string | null;
  microbiologicalRef: string | null;
  failureReason: string | null;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QCParameterPayload {
  category: QCParameterCategory;
  name: string;
  result: QCParameterResult;
  value?: string;
  remark?: string;
}

export interface CreateQualityCheckPayload {
  productionLineId: string;
  checkDate: string;
  parameters?: QCParameterPayload[];
  microbiologicalLab?: string;
  microbiologicalResult?: string;
  microbiologicalRef?: string;
  notes?: string;
}

export type UpdateQualityCheckPayload = Partial<Omit<CreateQualityCheckPayload, 'productionLineId'>>;

export interface QualityCheckQueryParams {
  page?: number;
  limit?: number;
  result?: QualityCheckResult;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Paginated Response ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Inventory valuation & low-stock ─────────────────────────────────────────
export interface InventoryValuationRow {
  id: string;
  name: string;
  code: string;
  group: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  unitValue: number;
  totalValue: number;
  lowStock: boolean;
  costMissing: boolean;
  basis: "unitPrice" | "unitCost";
}

export interface InventoryValuation {
  products: InventoryValuationRow[];
  rawMaterials: InventoryValuationRow[];
  lowStock: InventoryValuationRow[];
  summary: {
    productValue: number;
    materialValue: number;
    totalValue: number;
    productCount: number;
    materialCount: number;
    lowStockCount: number;
  };
}
