'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '../services/employee.service';
import type {
  Employee,
  EmployeeStats,
  EmployeeQueryParams,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from '../types/employee';

interface UseEmployeesReturn {
  employees: Employee[];
  stats: EmployeeStats | null;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  loading: boolean;
  error: string | null;
  query: EmployeeQueryParams;
  setQuery: (params: Partial<EmployeeQueryParams>) => void;
  createEmployee: (data: CreateEmployeePayload) => Promise<Employee>;
  updateEmployee: (id: string, data: UpdateEmployeePayload) => Promise<Employee>;
  deactivateEmployee: (id: string) => Promise<void>;
  refresh: () => void;
}

const DEFAULT_QUERY: EmployeeQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export function useEmployees(initialQuery?: Partial<EmployeeQueryParams>, options?: { enabled?: boolean }): UseEmployeesReturn {
  const queryClient = useQueryClient();
  const [query, setQueryState] = useState<EmployeeQueryParams>({ ...DEFAULT_QUERY, ...initialQuery });

  const setQuery = useCallback((params: Partial<EmployeeQueryParams>) => {
    setQueryState((prev) => ({ ...prev, ...params }));
  }, []);

  // Fetch employees list
  const {
    data: employeesData,
    isLoading: loadingEmployees,
    error: employeesError,
  } = useQuery({
    queryKey: ['employees', query],
    queryFn: () => employeeService.getAll(query),
    enabled: options?.enabled,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['employees', 'stats'],
    queryFn: () => employeeService.getStats(),
    enabled: options?.enabled,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeePayload) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeePayload }) => employeeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => employeeService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    employees: employeesData?.data ?? [],
    stats: stats ?? null,
    pagination: {
      total: employeesData?.total ?? 0,
      page: employeesData?.page ?? 1,
      limit: employeesData?.limit ?? 10,
      totalPages: employeesData?.totalPages ?? 0,
    },
    loading: loadingEmployees,
    error: employeesError?.message ?? null,
    query,
    setQuery,
    createEmployee: (data: CreateEmployeePayload) => createMutation.mutateAsync(data),
    updateEmployee: (id: string, data: UpdateEmployeePayload) => updateMutation.mutateAsync({ id, data }),
    deactivateEmployee: (id: string) => deactivateMutation.mutateAsync(id).then(() => undefined),
    refresh: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  };
}
