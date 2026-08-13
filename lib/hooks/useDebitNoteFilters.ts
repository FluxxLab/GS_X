'use client';

import { useState, useCallback } from 'react';
import type { DebitNoteQueryParams } from '@/lib/types/finance';
import { DN_ITEMS_PER_PAGE, DN_STATUSES } from '@/lib/constants/debit-note';

/** Owns the debit-notes list filters: search, status, page. */
export function useDebitNoteFilters() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [queryParams, setQueryParams] = useState<DebitNoteQueryParams>({
    page: 1,
    limit: DN_ITEMS_PER_PAGE,
  });

  const build = useCallback((searchVal: string, status: string, pageNum: number) => {
    const params: DebitNoteQueryParams = { page: pageNum, limit: DN_ITEMS_PER_PAGE };
    if (searchVal) params.search = searchVal;
    const entry = DN_STATUSES.find((s) => s.value === status);
    if (entry?.apiValue) params.status = entry.apiValue;
    setQueryParams(params);
  }, []);

  const onSearchChange = (v: string) => { setSearch(v); setPage(1); build(v, statusFilter, 1); };
  const onStatusChange = (v: string) => { setStatusFilter(v); setPage(1); build(search, v, 1); };
  const goToPage = (p: number) => { setPage(p); build(search, statusFilter, p); };

  return { search, statusFilter, page, queryParams, onSearchChange, onStatusChange, goToPage };
}
