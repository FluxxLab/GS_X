import type { SalesReportStatus } from '@/lib/types/sales';

type Badge = { bg: string; color: string };

export const SALES_STATUS_BADGE: Record<SalesReportStatus, Badge> = {
  DRAFT:     { bg: '#F4F6FB', color: '#70768E' },
  SUBMITTED: { bg: '#FEF3C7', color: '#92400E' },
  APPROVED:  { bg: '#D1FAE5', color: '#065F46' },
  REJECTED:  { bg: '#FEE2E2', color: '#991B1B' },
};

export const SALES_STATUS_TABS: { label: string; value: SalesReportStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];
