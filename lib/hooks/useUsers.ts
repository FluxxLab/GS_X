'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type {
  User,
  UserStats,
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types/user';

interface UseUsersReturn {
  users: User[];
  stats: UserStats | null;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  loading: boolean;
  error: string | null;
  query: UserQueryParams;
  setQuery: (params: Partial<UserQueryParams>) => void;
  createUser: (data: CreateUserPayload) => Promise<User>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<User>;
  deactivateUser: (id: string) => Promise<void>;
  refresh: () => void;
}

const DEFAULT_QUERY: UserQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export function useUsers(): UseUsersReturn {
  const queryClient = useQueryClient();
  const [query, setQueryState] = useState<UserQueryParams>(DEFAULT_QUERY);

  const setQuery = useCallback((params: Partial<UserQueryParams>) => {
    setQueryState((prev) => ({ ...prev, ...params }));
  }, []);

  // Fetch users list
  const {
    data: usersData,
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ['users', query],
    queryFn: () => userService.getAll(query),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => userService.getStats(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserPayload) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: usersData?.data ?? [],
    stats: stats ?? null,
    pagination: {
      total: usersData?.total ?? 0,
      page: usersData?.page ?? 1,
      limit: usersData?.limit ?? 10,
      totalPages: usersData?.totalPages ?? 0,
    },
    loading: loadingUsers,
    error: usersError?.message ?? null,
    query,
    setQuery,
    createUser: (data: CreateUserPayload) => createMutation.mutateAsync(data),
    updateUser: (id: string, data: UpdateUserPayload) => updateMutation.mutateAsync({ id, data }),
    deactivateUser: (id: string) => deactivateMutation.mutateAsync(id).then(() => undefined),
    refresh: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  };
}
