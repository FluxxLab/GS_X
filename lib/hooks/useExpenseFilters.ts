'use client';

import { useState, useRef, useCallback } from 'react';
import type { ExpenseQueryParams, ExpenseStatus, ExpenseCategory } from '@/lib/types/finance';
import { ITEMS_PER_PAGE, STATUS_TO_API, CATEGORY_TO_API, type DisplayCategory } from '@/lib/constants/expense';

/**
 * Owns the expenses list filters: search (debounced), status, category, page,
 * and the derived `queryParams` the data hook consumes. Keeps the page free of
 * the filter/debounce plumbing.
 */
export function useExpenseFilters() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [queryParams, setQueryParams] = useState<ExpenseQueryParams>({ page: 1, limit: ITEMS_PER_PAGE });
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const build = useCallback((status: string, category: string, searchVal: string, pageNum: number) => {
    const params: ExpenseQueryParams = { page: pageNum, limit: ITEMS_PER_PAGE };
    if (status !== 'All') params.status = STATUS_TO_API[status] as ExpenseStatus;
    if (category !== 'All') params.category = CATEGORY_TO_API[category as DisplayCategory] as ExpenseCategory;
    if (searchVal) params.search = searchVal;
    setQueryParams(params);
  }, []);

  const onSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => build(statusFilter, categoryFilter, v, 1), 400);
  };

  const onStatusChange = (v: string) => { setStatusFilter(v); setPage(1); build(v, categoryFilter, search, 1); };
  const onCategoryChange = (v: string) => { setCategoryFilter(v); setPage(1); build(statusFilter, v, search, 1); };
  const goToPage = (p: number) => { setPage(p); build(statusFilter, categoryFilter, search, p); };

  return { search, statusFilter, categoryFilter, page, queryParams, onSearchChange, onStatusChange, onCategoryChange, goToPage };
}
