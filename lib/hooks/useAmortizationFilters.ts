'use client';

import { useState, useCallback } from 'react';
import type { AmortizationQueryParams } from '@/lib/types/finance';
import { AMORT_ITEMS_PER_PAGE, AMORT_STATUSES } from '@/lib/constants/amortization';

/** Owns the amortization list filters: search, status, page. */
export function useAmortizationFilters() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [queryParams, setQueryParams] = useState<AmortizationQueryParams>({
    page: 1,
    limit: AMORT_ITEMS_PER_PAGE,
  });

  const build = useCallback((searchVal: string, status: string, pageNum: number) => {
    const params: AmortizationQueryParams = { page: pageNum, limit: AMORT_ITEMS_PER_PAGE };
    if (searchVal) params.search = searchVal;
    const entry = AMORT_STATUSES.find((s) => s.value === status);
    if (entry?.apiValue) params.status = entry.apiValue;
    setQueryParams(params);
  }, []);

  const onSearchChange = (v: string) => { setSearch(v); setPage(1); build(v, statusFilter, 1); };
  const onStatusChange = (v: string) => { setStatusFilter(v); setPage(1); build(search, v, 1); };
  const goToPage = (p: number) => { setPage(p); build(search, statusFilter, p); };

  return { search, statusFilter, page, queryParams, onSearchChange, onStatusChange, goToPage };
}
