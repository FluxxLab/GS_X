'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsService } from '../services/operations.service';
import type {
  PreventiveScheduleQueryParams,
  CreatePreventiveSchedulePayload,
  UpdatePreventiveSchedulePayload,
} from '../types/operations';

export function usePreventiveSchedules(params?: PreventiveScheduleQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operations', 'preventive-schedules', params],
    queryFn: () => operationsService.getSchedules(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePreventiveSchedulePayload) => operationsService.createSchedule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'preventive-schedules'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePreventiveSchedulePayload }) => operationsService.updateSchedule(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'preventive-schedules'] }),
  });

  return {
    schedules: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createSchedule: createMutation.mutateAsync,
    updateSchedule: (id: string, payload: UpdatePreventiveSchedulePayload) => updateMutation.mutateAsync({ id, data: payload }),
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['operations', 'preventive-schedules'] }),
  };
}
