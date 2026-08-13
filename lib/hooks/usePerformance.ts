'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService } from '@/lib/services/performance.service';
import { employeeService } from '@/lib/services/employee.service';
import { authService } from '@/lib/services/auth.service';
import type { Employee } from '@/lib/types/employee';
import type { CreateTaskPayload, CreateKpiPayload, UpdateTaskPayload, UpdateKpiPayload } from '@/lib/types/performance';
import { CURRENT_QUARTER, CURRENT_YEAR } from '@/lib/constants/performance';

interface ViewState {
  activeTab: 'tasks' | 'kpis';
  page: number;
  statusFilter: string;
  viewMode: 'all' | 'my';
}

/**
 * Data layer for the performance page: resolves the current user (manage scope,
 * own employee id), loads the employee directory, runs the task/KPI queries with
 * stable keys, and exposes the create/update/workflow mutations. Components and
 * the page never touch the services directly.
 */
export function usePerformance({ activeTab, page, statusFilter, viewMode }: ViewState) {
  const queryClient = useQueryClient();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [myEmployeeId, setMyEmployeeId] = useState<string | null>(null);
  // Manage scope is derived from the locally-cached user (client-only read).
  const [canManage] = useState(() => {
    const user = authService.getUser();
    return !!user && user.accessScope !== 'self';
  });

  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      employeeService.getAll({ search: user.employeeId, limit: 1 }).then((r) => {
        const me = r.data.find((e) => e.employeeId === user.employeeId);
        if (me) setMyEmployeeId(me.id);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    employeeService.getAll({ limit: 200, sortBy: 'firstName', sortOrder: 'ASC' }).then((r) => {
      setEmployees(r.data);
    }).catch(() => {});
  }, []);

  const { data: stats } = useQuery({
    queryKey: ['performance', 'task-stats'],
    queryFn: () => performanceService.getTaskStats(),
  });

  const taskParams = {
    ...(statusFilter !== 'all' && activeTab === 'tasks' ? { status: statusFilter } : {}),
    ...(viewMode === 'my' && myEmployeeId ? { assigneeId: myEmployeeId } : {}),
    page, limit: 15,
  };
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['performance', 'tasks', taskParams],
    queryFn: () => performanceService.getTasks(taskParams),
    enabled: activeTab === 'tasks',
  });

  const kpiParams = { quarter: CURRENT_QUARTER, year: CURRENT_YEAR, page, limit: 15 };
  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['performance', 'kpis', kpiParams],
    queryFn: () => performanceService.getKpis(kpiParams),
    enabled: activeTab === 'kpis',
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['performance'] });

  const createTaskMut = useMutation({
    mutationFn: (p: CreateTaskPayload) => performanceService.createTask(p),
    onSuccess: invalidate,
  });
  const createKpiMut = useMutation({
    mutationFn: (p: CreateKpiPayload) => performanceService.createKpi(p),
    onSuccess: invalidate,
  });
  const updateTaskMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) => performanceService.updateTask(id, data),
    onSuccess: invalidate,
  });
  const submitTaskMut = useMutation({
    mutationFn: ({ id, evidence }: { id: string; evidence: string }) => performanceService.submitTask(id, evidence),
    onSuccess: invalidate,
  });
  const verifyTaskMut = useMutation({
    mutationFn: (id: string) => performanceService.verifyTask(id),
    onSuccess: invalidate,
  });
  const rejectTaskMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => performanceService.rejectTask(id, reason),
    onSuccess: invalidate,
  });
  const updateKpiMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKpiPayload }) => performanceService.updateKpi(id, data),
    onSuccess: invalidate,
  });

  return {
    employees, myEmployeeId, canManage,
    stats,
    tasks: tasksData?.data || [],
    kpis: kpisData?.data || [],
    totalPages: activeTab === 'tasks' ? (tasksData?.totalPages || 1) : (kpisData?.totalPages || 1),
    tasksLoading, kpisLoading,
    createTaskMut, createKpiMut, updateTaskMut, submitTaskMut, verifyTaskMut, rejectTaskMut, updateKpiMut,
  };
}
