'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsService } from '../services/operations.service';
import type {
  ProjectQueryParams,
  CreateProjectPayload,
  UpdateProjectPayload,
} from '../types/operations';

export function useProjects(params?: ProjectQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operations', 'projects', params],
    queryFn: () => operationsService.getProjects(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => operationsService.createProject(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'projects'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) => operationsService.updateProject(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'projects'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => operationsService.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'projects'] }),
  });

  return {
    projects: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createProject: createMutation.mutateAsync,
    updateProject: (id: string, payload: UpdateProjectPayload) => updateMutation.mutateAsync({ id, data: payload }),
    deleteProject: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['operations', 'projects'] }),
  };
}
