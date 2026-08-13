import type {
  ProductionReportStatus,
  BatchStatus,
  QualityCheckResult,
  QCParameterCategory,
  QCParameterResult,
  ProductType,
  RawMaterialCategory,
  UnitOfMeasure,
} from '@/lib/types/manufacturing';

type Badge = { bg: string; color: string };

// ─── Production report status ────────────────────────────────────────────────

export const PRODUCTION_STATUS_BADGE: Record<ProductionReportStatus, Badge> = {
  DRAFT:     { bg: '#F4F6FB', color: '#70768E' },
  SUBMITTED: { bg: '#FEF3C7', color: '#92400E' },
  APPROVED:  { bg: '#D1FAE5', color: '#065F46' },
  REJECTED:  { bg: '#FEE2E2', color: '#991B1B' },
};

export const PRODUCTION_STATUS_TABS: { label: string; value: ProductionReportStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

// ─── Batch status ────────────────────────────────────────────────────────────

export const BATCH_STATUS_BADGE: Record<BatchStatus, Badge> = {
  IN_PRODUCTION: { bg: '#DBEAFE', color: '#1E40AF' },
  QC_PENDING:    { bg: '#FEF3C7', color: '#92400E' },
  QC_PASSED:     { bg: '#D1FAE5', color: '#065F46' },
  QC_FAILED:     { bg: '#FEE2E2', color: '#991B1B' },
  RELEASED:      { bg: '#DCFCE7', color: '#15803D' },
  RECALLED:      { bg: '#FEE2E2', color: '#991B1B' },
};

// ─── Quality check result ────────────────────────────────────────────────────

export const QC_RESULT_BADGE: Record<QualityCheckResult, Badge> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  PASS:    { bg: '#D1FAE5', color: '#065F46' },
  FAIL:    { bg: '#FEE2E2', color: '#991B1B' },
};

export const QC_RESULT_TABS: { label: string; value: QualityCheckResult | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Pass', value: 'PASS' },
  { label: 'Fail', value: 'FAIL' },
];

// ─── QC parameter checklist enums ────────────────────────────────────────────

export const QC_PARAMETER_CATEGORIES: QCParameterCategory[] = ['WATER', 'FINISHED_PRODUCT', 'MICROBIOLOGICAL'];

export const QC_PARAMETER_CATEGORY_LABEL: Record<QCParameterCategory, string> = {
  WATER: 'Water',
  FINISHED_PRODUCT: 'Finished Product',
  MICROBIOLOGICAL: 'Microbiological',
};

export const QC_PARAMETER_RESULTS: QCParameterResult[] = ['PENDING', 'PASS', 'FAIL', 'NA'];

// ─── Label maps + option lists ───────────────────────────────────────────────

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  SACHET_WATER: 'Sachet Water',
  BOTTLED_WATER: 'Bottled Water',
  DISPENSER_WATER: 'Dispenser Water',
};

export const PRODUCT_TYPES: ProductType[] = ['SACHET_WATER', 'BOTTLED_WATER', 'DISPENSER_WATER'];

export const RAW_MATERIAL_CATEGORY_LABEL: Record<RawMaterialCategory, string> = {
  NYLON_ROLL: 'Nylon Roll',
  BOTTLE_PREFORM: 'Bottle Preform',
  CAP: 'Cap',
  LABEL: 'Label',
  SHRINK_WRAP: 'Shrink Wrap',
  CHEMICAL: 'Chemical',
  OTHER: 'Other',
};

export const RAW_MATERIAL_CATEGORIES: RawMaterialCategory[] = [
  'NYLON_ROLL', 'BOTTLE_PREFORM', 'CAP', 'LABEL', 'SHRINK_WRAP', 'CHEMICAL', 'OTHER',
];

export const UNITS_OF_MEASURE: UnitOfMeasure[] = [
  'BAG', 'PACK', 'PIECE', 'BOTTLE', 'CARTON', 'ROLL', 'UNIT', 'LITRE', 'KILOGRAM',
];
