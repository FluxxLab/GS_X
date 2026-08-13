import { apiClient } from '../api/client';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductQueryParams,
  RawMaterial,
  CreateRawMaterialPayload,
  UpdateRawMaterialPayload,
  RawMaterialQueryParams,
  StockMovement,
  AdjustStockPayload,
  ProductionReport,
  CreateProductionReportPayload,
  UpdateProductionReportPayload,
  ProductionReportQueryParams,
  ProductionLine,
  QualityCheck,
  CreateQualityCheckPayload,
  UpdateQualityCheckPayload,
  QualityCheckQueryParams,
  InventoryValuation,
  PaginatedResponse,
} from '../types/manufacturing';

const INVENTORY = '/manufacturing/inventory';
const PRODUCTION = '/manufacturing/production-reports';
const QC = '/manufacturing/quality-checks';

type QueryRecord = Record<string, string | number | boolean | undefined>;

export const manufacturingService = {
  // ─── Inventory: Valuation ───────────────────────────────────────────────────

  getInventoryValuation(): Promise<InventoryValuation> {
    return apiClient.get<InventoryValuation>(`${INVENTORY}/valuation`);
  },

  getLowStockCount(): Promise<{ count: number; products: number; rawMaterials: number }> {
    return apiClient.get(`${INVENTORY}/low-stock-count`);
  },

  // ─── Inventory: Products ────────────────────────────────────────────────────

  getProducts(params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>(`${INVENTORY}/products`, params as QueryRecord);
  },

  getProduct(id: string): Promise<Product> {
    return apiClient.get<Product>(`${INVENTORY}/products/${id}`);
  },

  createProduct(data: CreateProductPayload): Promise<Product> {
    return apiClient.post<Product>(`${INVENTORY}/products`, data);
  },

  updateProduct(id: string, data: UpdateProductPayload): Promise<Product> {
    return apiClient.patch<Product>(`${INVENTORY}/products/${id}`, data);
  },

  deleteProduct(id: string): Promise<void> {
    return apiClient.delete<void>(`${INVENTORY}/products/${id}`);
  },

  adjustProductStock(id: string, data: AdjustStockPayload): Promise<StockMovement> {
    return apiClient.post<StockMovement>(`${INVENTORY}/products/${id}/adjust`, data);
  },

  getProductMovements(id: string): Promise<StockMovement[]> {
    return apiClient.get<StockMovement[]>(`${INVENTORY}/products/${id}/movements`);
  },

  // ─── Inventory: Raw Materials ───────────────────────────────────────────────

  getRawMaterials(params?: RawMaterialQueryParams): Promise<PaginatedResponse<RawMaterial>> {
    return apiClient.get<PaginatedResponse<RawMaterial>>(`${INVENTORY}/raw-materials`, params as QueryRecord);
  },

  getRawMaterial(id: string): Promise<RawMaterial> {
    return apiClient.get<RawMaterial>(`${INVENTORY}/raw-materials/${id}`);
  },

  createRawMaterial(data: CreateRawMaterialPayload): Promise<RawMaterial> {
    return apiClient.post<RawMaterial>(`${INVENTORY}/raw-materials`, data);
  },

  updateRawMaterial(id: string, data: UpdateRawMaterialPayload): Promise<RawMaterial> {
    return apiClient.patch<RawMaterial>(`${INVENTORY}/raw-materials/${id}`, data);
  },

  deleteRawMaterial(id: string): Promise<void> {
    return apiClient.delete<void>(`${INVENTORY}/raw-materials/${id}`);
  },

  adjustRawMaterialStock(id: string, data: AdjustStockPayload): Promise<StockMovement> {
    return apiClient.post<StockMovement>(`${INVENTORY}/raw-materials/${id}/adjust`, data);
  },

  getRawMaterialMovements(id: string): Promise<StockMovement[]> {
    return apiClient.get<StockMovement[]>(`${INVENTORY}/raw-materials/${id}/movements`);
  },

  // ─── Production Reports ──────────────────────────────────────────────────────

  getProductionReports(params?: ProductionReportQueryParams): Promise<PaginatedResponse<ProductionReport>> {
    return apiClient.get<PaginatedResponse<ProductionReport>>(PRODUCTION, params as QueryRecord);
  },

  getProductionReport(id: string): Promise<ProductionReport> {
    return apiClient.get<ProductionReport>(`${PRODUCTION}/${id}`);
  },

  createProductionReport(data: CreateProductionReportPayload): Promise<ProductionReport> {
    return apiClient.post<ProductionReport>(PRODUCTION, data);
  },

  updateProductionReport(id: string, data: UpdateProductionReportPayload): Promise<ProductionReport> {
    return apiClient.patch<ProductionReport>(`${PRODUCTION}/${id}`, data);
  },

  submitProductionReport(id: string): Promise<ProductionReport> {
    return apiClient.patch<ProductionReport>(`${PRODUCTION}/${id}/submit`);
  },

  approveProductionReport(id: string): Promise<ProductionReport> {
    return apiClient.patch<ProductionReport>(`${PRODUCTION}/${id}/approve`);
  },

  rejectProductionReport(id: string, reason: string): Promise<ProductionReport> {
    return apiClient.patch<ProductionReport>(`${PRODUCTION}/${id}/reject`, { reason });
  },

  deleteProductionReport(id: string): Promise<void> {
    return apiClient.delete<void>(`${PRODUCTION}/${id}`);
  },

  // ─── Quality Control ─────────────────────────────────────────────────────────

  getQualityChecks(params?: QualityCheckQueryParams): Promise<PaginatedResponse<QualityCheck>> {
    return apiClient.get<PaginatedResponse<QualityCheck>>(QC, params as QueryRecord);
  },

  getQualityCheck(id: string): Promise<QualityCheck> {
    return apiClient.get<QualityCheck>(`${QC}/${id}`);
  },

  getBatchQualityChecks(lineId: string): Promise<QualityCheck[]> {
    return apiClient.get<QualityCheck[]>(`${QC}/batch/${lineId}`);
  },

  getPendingBatches(): Promise<ProductionLine[]> {
    return apiClient.get<ProductionLine[]>(`${QC}/batches/pending`);
  },

  createQualityCheck(data: CreateQualityCheckPayload): Promise<QualityCheck> {
    return apiClient.post<QualityCheck>(QC, data);
  },

  updateQualityCheck(id: string, data: UpdateQualityCheckPayload): Promise<QualityCheck> {
    return apiClient.patch<QualityCheck>(`${QC}/${id}`, data);
  },

  passQualityCheck(id: string): Promise<QualityCheck> {
    return apiClient.patch<QualityCheck>(`${QC}/${id}/pass`);
  },

  failQualityCheck(id: string, reason: string): Promise<QualityCheck> {
    return apiClient.patch<QualityCheck>(`${QC}/${id}/fail`, { reason });
  },

  deleteQualityCheck(id: string): Promise<void> {
    return apiClient.delete<void>(`${QC}/${id}`);
  },

  releaseBatch(lineId: string): Promise<ProductionLine> {
    return apiClient.patch<ProductionLine>(`${QC}/batches/${lineId}/release`);
  },

  recallBatch(lineId: string): Promise<ProductionLine> {
    return apiClient.patch<ProductionLine>(`${QC}/batches/${lineId}/recall`);
  },
};
