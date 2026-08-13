'use client';

import { useQuery } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type { AuditLogQueryParams } from '../types/finance';

export function useAuditLogs(params?: AuditLogQueryParams) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => financeService.getAuditLogs(params),
  });

  return {
    logs: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    error: isError,
  };
}

export function useEntityAuditLogs(entityType: string, entityId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', 'entity', entityType, entityId],
    queryFn: () => financeService.getEntityAuditLogs(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });

  return {
    logs: data ?? [],
    loading: isLoading,
  };
}
