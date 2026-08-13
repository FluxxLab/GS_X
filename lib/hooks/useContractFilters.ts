'use client';

import { useState, useRef, useCallback } from 'react';
import type { ContractQueryParams, ContractStatus } from '@/lib/types/finance';
import { ITEMS_PER_PAGE, CONTRACT_STATUS_TO_API } from '@/lib/constants/procurement';

/**
 * Owns the contracts list filters: search (debounced), status tab, page, and
 * the derived `queryParams` the data hook consumes. Mirrors `useExpenseFilters`.
 */
export function useContractFilters() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [queryParams, setQueryParams] = useState<ContractQueryParams>({ page: 1, limit: ITEMS_PER_PAGE });
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const build = useCallback((status: string, searchVal: string, pageNum: number) => {
    const params: ContractQueryParams = { page: pageNum, limit: ITEMS_PER_PAGE };
    if (status !== 'All') params.status = CONTRACT_STATUS_TO_API[status] as ContractStatus;
    if (searchVal) params.search = searchVal;
    setQueryParams(params);
  }, []);

  const onSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => build(statusFilter, v, 1), 400);
  };

  const onStatusChange = (v: string) => { setStatusFilter(v); setPage(1); build(v, search, 1); };
  const goToPage = (p: number) => { setPage(p); build(statusFilter, search, p); };

  return { search, statusFilter, page, queryParams, onSearchChange, onStatusChange, goToPage };
}
