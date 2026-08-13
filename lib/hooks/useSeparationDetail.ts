'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { separationService } from '../services/separation.service';
import type {
  UpdateSeparationPayload,
  CreateHandoverNotePayload,
  UpdateHandoverNotePayload,
  UpdateClearanceItemPayload,
  UpdateSettlementPayload,
} from '../types/separation';

export function useSeparationDetail(id: string) {
  const qc = useQueryClient();
  const qk = ['separations', id];

  const { data, isLoading } = useQuery({
    queryKey: qk,
    queryFn: () => separationService.getOne(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSeparationPayload) => separationService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  const advanceMutation = useMutation({
    mutationFn: () => separationService.advance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  // Handover
  const addHandoverMutation = useMutation({
    mutationFn: (payload: CreateHandoverNotePayload) => separationService.addHandoverNote(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });
  const updateHandoverMutation = useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: UpdateHandoverNotePayload }) =>
      separationService.updateHandoverNote(noteId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });
  const deleteHandoverMutation = useMutation({
    mutationFn: (noteId: string) => separationService.deleteHandoverNote(noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  // Clearance
  const updateClearanceMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateClearanceItemPayload }) =>
      separationService.updateClearanceItem(itemId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  // Settlement
  const updateSettlementMutation = useMutation({
    mutationFn: (payload: UpdateSettlementPayload) => separationService.updateSettlement(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });
  const approveSettlementMutation = useMutation({
    mutationFn: () => separationService.approveSettlement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  return {
    separation: data ?? null,
    loading: isLoading,
    update: updateMutation.mutateAsync,
    advance: advanceMutation.mutateAsync,
    addHandover: addHandoverMutation.mutateAsync,
    updateHandover: updateHandoverMutation.mutateAsync,
    deleteHandover: deleteHandoverMutation.mutateAsync,
    updateClearance: updateClearanceMutation.mutateAsync,
    updateSettlement: updateSettlementMutation.mutateAsync,
    approveSettlement: approveSettlementMutation.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: qk }),
  };
}
