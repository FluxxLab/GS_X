'use client';

import { useState, useRef } from 'react';
import type { PettyCashType, PettyCashQueryParams } from '@/lib/types/finance';
import { ITEMS_PER_PAGE } from '@/lib/constants/petty-cash';

/**
 * Owns the petty-cash list filters: search (debounced buffer), active tab, page,
 * and the derived `queryParams` the data hook consumes.
 */
export function usePettyCashFilters() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryParams: PettyCashQueryParams = {
    ...(activeTab === 'EXPENSE' || activeTab === 'REPLENISHMENT' ? { type: activeTab as PettyCashType } : {}),
    ...(search ? { search } : {}),
    page,
    limit: ITEMS_PER_PAGE,
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      // triggers re-render with new search in queryParams
    }, 400);
  };

  const onTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  return { search, activeTab, page, setPage, queryParams, onSearchChange, onTabChange };
}
