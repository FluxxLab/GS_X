import type { WorkOrderStatus } from '@/lib/types/operations';

/** Currency formatter for work-order costs (Naira, no fraction digits). */
export function fmtCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '₦ 0';
  return '₦ ' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Date formatter for work-order rows. */
export function formatDate(d: string | null | undefined): string {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  DRAFT:            { bg: '#F4F6FB', color: '#70768E' },
  PENDING_APPROVAL: { bg: '#FEF3C7', color: '#92400E' },
  OPEN:             { bg: '#DBEAFE', color: '#1E40AF' },
  IN_PROGRESS:      { bg: '#FEF3C7', color: '#92400E' },
  ON_HOLD:          { bg: '#FEE2E2', color: '#991B1B' },
  COMPLETED:        { bg: '#D1FAE5', color: '#065F46' },
  CANCELLED:        { bg: '#F4F6FB', color: '#8B93AD' },
};

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PRIORITY_BADGE: Record<string, { bg: string; color: string }> = {
  LOW:      { bg: '#F4F6FB', color: '#70768E' },
  MEDIUM:   { bg: '#DBEAFE', color: '#1E40AF' },
  HIGH:     { bg: '#FEF3C7', color: '#92400E' },
  CRITICAL: { bg: '#FEE2E2', color: '#991B1B' },
};

export const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  PREVENTIVE:  { bg: '#D1FAE5', color: '#065F46' },
  CORRECTIVE:  { bg: '#FEF3C7', color: '#92400E' },
  EMERGENCY:   { bg: '#FEE2E2', color: '#991B1B' },
  INSPECTION:  { bg: '#DBEAFE', color: '#1E40AF' },
};

export const STATUS_TABS: { label: string; value: WorkOrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Completed', value: 'COMPLETED' },
];

export const MAINTENANCE_TYPES = ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'INSPECTION'];
export const WORK_ORDER_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
