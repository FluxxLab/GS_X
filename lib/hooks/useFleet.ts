'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsService } from '../services/operations.service';
import type {
  VehicleQueryParams,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  FuelLogQueryParams,
  CreateFuelLogPayload,
  TripLogQueryParams,
  CreateTripPayload,
  CompleteTripPayload,
} from '../types/operations';

export function useVehicles(params?: VehicleQueryParams, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operations', 'vehicles', params],
    enabled: options?.enabled,
    queryFn: () => operationsService.getVehicles(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateVehiclePayload) => operationsService.createVehicle(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'vehicles'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehiclePayload }) => operationsService.updateVehicle(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'vehicles'] }),
  });

  return {
    vehicles: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createVehicle: createMutation.mutateAsync,
    updateVehicle: (id: string, payload: UpdateVehiclePayload) => updateMutation.mutateAsync({ id, data: payload }),
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['operations', 'vehicles'] }),
  };
}

export function useFuelLogs(params?: FuelLogQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operations', 'fuel-logs', params],
    queryFn: () => operationsService.getFuelLogs(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateFuelLogPayload) => operationsService.createFuelLog(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'fuel-logs'] }),
  });

  return {
    fuelLogs: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createFuelLog: createMutation.mutateAsync,
    creating: createMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['operations', 'fuel-logs'] }),
  };
}

export function useTripLogs(params?: TripLogQueryParams) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operations', 'trip-logs', params],
    queryFn: () => operationsService.getTripLogs(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTripPayload) => operationsService.createTrip(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'trip-logs'] }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteTripPayload }) => operationsService.completeTrip(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'trip-logs'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) => operationsService.approveTrip(id, approvedBy),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'trip-logs'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => operationsService.rejectTrip(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operations', 'trip-logs'] }),
  });

  return {
    tripLogs: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    loading: isLoading,
    createTrip: createMutation.mutateAsync,
    completeTrip: (id: string, payload: CompleteTripPayload) => completeMutation.mutateAsync({ id, data: payload }),
    approveTrip: (id: string, approvedBy: string) => approveMutation.mutateAsync({ id, approvedBy }),
    rejectTrip: (id: string, reason?: string) => rejectMutation.mutateAsync({ id, reason }),
    creating: createMutation.isPending,
    completing: completeMutation.isPending,
    approving: approveMutation.isPending,
    rejecting: rejectMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['operations', 'trip-logs'] }),
  };
}
