'use client';

import { useState } from 'react';
import type { TaxType, TaxFilingStatus, TaxFilingQueryParams } from '@/lib/types/payroll';

/** Owns the tax-filing list filters (year/type/status/page) + derived queryParams. */
export function useTaxFilingFilters() {
  const now = new Date();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState(now.getFullYear());

  const queryParams: TaxFilingQueryParams = {
    ...(typeFilter !== 'all' ? { taxType: typeFilter as TaxType } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter as TaxFilingStatus } : {}),
    year: yearFilter,
    page,
    limit: 15,
  };

  const onYearChange = (v: number) => { setYearFilter(v); setPage(1); };
  const onTypeChange = (v: string) => { setTypeFilter(v); setPage(1); };
  const onStatusChange = (v: string) => { setStatusFilter(v); setPage(1); };

  return { page, setPage, typeFilter, statusFilter, yearFilter, queryParams, onYearChange, onTypeChange, onStatusChange };
}
