'use client';

import { useMemo, useState } from 'react';
import { useAuditLogs } from '@/lib/hooks/useAuditLogs';
import {
  actionStatus,
  deriveInitials,
  type AuditEntry,
} from '@/lib/constants/audit-log';
import { humanizeAction, humanizeActivity } from '@/lib/constants/user-profile';
import type { AuditAction, AuditLog, AuditLogQueryParams } from '@/lib/types/finance';

const PAGE_SIZE = 20;

/** Format an ISO timestamp as e.g. "Mar 21, 2026 10:42 AM". */
function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Build a human-readable description, falling back when none is stored. */
function describeChanges(log: AuditLog): string {
  if (log.description) return log.description;
  if (log.changes && Object.keys(log.changes).length > 0) {
    const fields = Object.keys(log.changes).join(', ');
    return `${humanizeAction(log.action)} · ${fields}`;
  }
  // Reads e.g. "Signed in" for security events, "Created user" for CRUD.
  return humanizeActivity({ action: log.action, entityType: log.entityType });
}

/** Project a real `AuditLog` into the table's display row. */
function toEntry(log: AuditLog): AuditEntry {
  return {
    id: log.id,
    timestamp: formatTimestamp(log.performedAt),
    user: log.performedBy,
    initials: deriveInitials(log.performedBy),
    action: humanizeAction(log.action),
    description: describeChanges(log),
    module: log.entityType,
    ipAddress: log.ipAddress ?? 'N/A',
    status: actionStatus[log.action] ?? 'Info',
    eventType: log.action,
  };
}

/**
 * Owns the Audit Logs filters, server pagination, and the projection of real
 * `AuditLog` records into table rows.
 *
 * Backend-supported filters (wired to query params): `action` (the "event type"
 * select), `performedBy` (the user select), `startDate`/`endDate` (the date
 * range). Free-text `search` has no backend equivalent, so it is applied
 * client-side over the loaded page only.
 */
export function useAuditLogFilters() {
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<'All' | AuditAction>('All');
  const [userFilter, setUserFilter] = useState('All Users');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const params: AuditLogQueryParams = useMemo(() => {
    const p: AuditLogQueryParams = { page, limit: PAGE_SIZE };
    if (eventTypeFilter !== 'All') p.action = eventTypeFilter;
    if (userFilter !== 'All Users') p.performedBy = userFilter;
    if (dateFrom) p.startDate = new Date(dateFrom).toISOString();
    if (dateTo) {
      // Include the whole "to" day.
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      p.endDate = end.toISOString();
    }
    return p;
  }, [page, eventTypeFilter, userFilter, dateFrom, dateTo]);

  const { logs, total, totalPages, loading } = useAuditLogs(params);

  const entries = useMemo(() => logs.map(toEntry), [logs]);

  // Client-side free-text search over the loaded page (no backend equivalent).
  const filteredEntries: AuditEntry[] = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.user.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.module.toLowerCase().includes(q),
    );
  }, [entries, search]);

  // User dropdown options derived from the loaded page (no users endpoint here).
  const userOptions = useMemo(() => {
    const set = new Set(entries.map((e) => e.user).filter(Boolean));
    return ['All Users', ...Array.from(set).sort()];
  }, [entries]);

  // Reset to page 1 whenever a server-side filter changes.
  const onFilterChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  return {
    search,
    setSearch,
    eventTypeFilter,
    setEventTypeFilter: onFilterChange(setEventTypeFilter),
    userFilter,
    setUserFilter: onFilterChange(setUserFilter),
    dateFrom,
    setDateFrom: onFilterChange(setDateFrom),
    dateTo,
    setDateTo: onFilterChange(setDateTo),
    userOptions,
    filteredEntries,
    loading,
    page,
    totalPages,
    total,
    pageSize: PAGE_SIZE,
    goPrev: () => setPage((p) => Math.max(1, p - 1)),
    goNext: () => setPage((p) => Math.min(totalPages, p + 1)),
  };
}
