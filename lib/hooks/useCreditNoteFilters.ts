'use client';

import { useState, useCallback } from 'react';
import type { CreditNoteQueryParams } from '@/lib/types/finance';
import { CN_ITEMS_PER_PAGE, CN_STATUSES } from '@/lib/constants/credit-note';

/**
 * Owns the credit-notes list filters: search, status, page, and the derived
 * `queryParams` the data hook consumes. Search + status changes reset to page 1
 * (handler-driven, no set-state-in-effect).
 */
export function useCreditNoteFilters() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [queryParams, setQueryParams] = useState<CreditNoteQueryParams>({
    page: 1,
    limit: CN_ITEMS_PER_PAGE,
  });

  const build = useCallback(
    (searchVal: string, status: string, pageNum: number) => {
      const params: CreditNoteQueryParams = {
        page: pageNum,
        limit: CN_ITEMS_PER_PAGE,
      };
      if (searchVal) params.search = searchVal;
      const statusEntry = CN_STATUSES.find((s) => s.value === status);
      if (statusEntry?.apiValue) params.status = statusEntry.apiValue;
      setQueryParams(params);
    },
    [],
  );

  const onSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
    build(v, statusFilter, 1);
  };
  const onStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(1);
    build(search, v, 1);
  };
  const goToPage = (p: number) => {
    setPage(p);
    build(search, statusFilter, p);
  };

  return {
    search,
    statusFilter,
    page,
    queryParams,
    onSearchChange,
    onStatusChange,
    goToPage,
  };
}
