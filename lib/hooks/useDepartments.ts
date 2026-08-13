'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../services/department.service';
import type {
  Department,
  DepartmentStats,
  DepartmentQueryParams,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '../types/department';

interface UseDepartmentsReturn {
  departments: Department[];
  stats: DepartmentStats | null;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  loading: boolean;
  error: string | null;
  query: DepartmentQueryParams;
  setQuery: (params: Partial<DepartmentQueryParams>) => void;
  createDepartment: (data: CreateDepartmentPayload) => Promise<Department>;
  updateDepartment: (id: string, data: UpdateDepartmentPayload) => Promise<Department>;
  deactivateDepartment: (id: string) => Promise<void>;
  refresh: () => void;
}

const DEFAULT_QUERY: DepartmentQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export function useDepartments(): UseDepartmentsReturn {
  const queryClient = useQueryClient();
  const [query, setQueryState] = useState<DepartmentQueryParams>(DEFAULT_QUERY);

  const setQuery = useCallback((params: Partial<DepartmentQueryParams>) => {
    setQueryState((prev) => ({ ...prev, ...params }));
  }, []);

  // Fetch departments list
  const {
    data: departmentsData,
    isLoading: loadingDepartments,
    error: departmentsError,
  } = useQuery({
    queryKey: ['departments', query],
    queryFn: () => departmentService.getAll(query),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['departments', 'stats'],
    queryFn: () => departmentService.getStats(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentPayload) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentPayload }) =>
      departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => departmentService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  return {
    departments: departmentsData?.data ?? [],
    stats: stats ?? null,
    pagination: {
      total: departmentsData?.total ?? 0,
      page: departmentsData?.page ?? 1,
      limit: departmentsData?.limit ?? 10,
      totalPages: departmentsData?.totalPages ?? 0,
    },
    loading: loadingDepartments,
    error: departmentsError?.message ?? null,
    query,
    setQuery,
    createDepartment: (data: CreateDepartmentPayload) => createMutation.mutateAsync(data),
    updateDepartment: (id: string, data: UpdateDepartmentPayload) =>
      updateMutation.mutateAsync({ id, data }),
    deactivateDepartment: (id: string) => deactivateMutation.mutateAsync(id).then(() => undefined),
    refresh: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  };
}
