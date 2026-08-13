'use client';

import { useState } from 'react';
import type { BudgetQueryParams } from '@/lib/types/finance';
import { tabToApiStatus } from '@/lib/constants/budget';

/**
 * Owns the budgets list filters: active tab + search, and the derived
 * `queryParams` the data hook consumes. Keeps the page free of filter plumbing.
 */
const PAGE_SIZE = 20;

export function useBudgetFilters() {
  const [activeTab, setActiveTabRaw] = useState('All Budgets');
  const [search, setSearchRaw] = useState('');
  const [page, setPage] = useState(1);

  // Any filter/search change resets to the first page.
  const setActiveTab = (v: string) => { setActiveTabRaw(v); setPage(1); };
  const setSearch = (v: string) => { setSearchRaw(v); setPage(1); };

  const queryParams: BudgetQueryParams = {
    page,
    limit: PAGE_SIZE,
    ...(activeTab !== 'All Budgets' && tabToApiStatus(activeTab) ? { status: tabToApiStatus(activeTab) } : {}),
    ...(search ? { search } : {}),
  };

  return { activeTab, setActiveTab, search, setSearch, queryParams, page, setPage, pageSize: PAGE_SIZE };
}
