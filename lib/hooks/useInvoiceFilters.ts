'use client';

import { useState, useCallback } from 'react';
import type { InvoiceQueryParams } from '@/lib/types/finance';
import { ITEMS_PER_PAGE, STATUSES } from '@/lib/constants/invoice';

/**
 * Owns the invoices list filters: search, status, page, and the derived
 * `queryParams` the data hook consumes. Mirrors the original effect-built params
 * (search + status reset to page 1) without the set-state-in-effect.
 */
export function useInvoiceFilters() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [queryParams, setQueryParams] = useState<InvoiceQueryParams>({ page: 1, limit: ITEMS_PER_PAGE });

  const build = useCallback((searchVal: string, status: string, pageNum: number) => {
    const params: InvoiceQueryParams = { page: pageNum, limit: ITEMS_PER_PAGE };
    if (searchVal) params.search = searchVal;
    const statusEntry = STATUSES.find((s) => s.value === status);
    if (statusEntry?.apiValue) params.status = statusEntry.apiValue;
    setQueryParams(params);
  }, []);

  const onSearchChange = (v: string) => { setSearch(v); setPage(1); build(v, statusFilter, 1); };
  const onStatusChange = (v: string) => { setStatusFilter(v); setPage(1); build(search, v, 1); };
  const goToPage = (p: number) => { setPage(p); build(search, statusFilter, p); };

  return { search, statusFilter, page, queryParams, onSearchChange, onStatusChange, goToPage };
}
