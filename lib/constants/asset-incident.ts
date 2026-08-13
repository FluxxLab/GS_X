import type { IncidentType, IncidentSeverity, IncidentStatus } from '@/lib/types/operations';

/** Date formatter for incident rows (matches the original page output). */
export function formatDate(d: string | null | undefined): string {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Currency formatter for incident loss values (Naira, no fraction digits).
 *  Coerces to a number first — API `numeric` columns arrive as strings, and
 *  `String.toLocaleString` would otherwise pass them through unformatted. */
export function formatCurrency(v: number | string | null | undefined): string {
  if (v == null || v === '') return '--';
  const n = Number(v);
  if (!Number.isFinite(n)) return '--';
  return '₦ ' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

export const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  REPORTED:      { bg: '#FEF3C7', color: '#92400E' },
  INVESTIGATING: { bg: '#DBEAFE', color: '#1E40AF' },
  RESOLVED:      { bg: '#D1FAE5', color: '#065F46' },
  WRITTEN_OFF:   { bg: '#F4F6FB', color: '#70768E' },
};

export const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  LOST:        { bg: '#FEE2E2', color: '#991B1B' },
  DAMAGED:     { bg: '#FEF3C7', color: '#92400E' },
  STOLEN:      { bg: '#FEE2E2', color: '#991B1B' },
  MALFUNCTION: { bg: '#DBEAFE', color: '#1E40AF' },
};

export const SEVERITY_BADGE: Record<string, { bg: string; color: string }> = {
  LOW:      { bg: '#F4F6FB', color: '#70768E' },
  MEDIUM:   { bg: '#DBEAFE', color: '#1E40AF' },
  HIGH:     { bg: '#FEF3C7', color: '#92400E' },
  CRITICAL: { bg: '#FEE2E2', color: '#991B1B' },
};

export const STATUS_TABS: { label: string; value: IncidentStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Reported', value: 'REPORTED' },
  { label: 'Investigating', value: 'INVESTIGATING' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Written Off', value: 'WRITTEN_OFF' },
];

export const INCIDENT_TYPES: IncidentType[] = ['LOST', 'DAMAGED', 'STOLEN', 'MALFUNCTION'];
export const SEVERITIES: IncidentSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
