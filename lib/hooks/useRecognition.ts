"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recognitionService } from "@/lib/services/recognition.service";
import type {
  NominateRecognitionPayload,
  DecideRecognitionPayload,
} from "@/lib/types/recognition";

const invalidateKeys = ["recognitions", "recognition-wall", "my-recognition", "recognition-values"];

/** HR queue: nominations in, awards out. */
export function useRecognitions(params?: { status?: string; type?: string; period?: string }) {
  const qc = useQueryClient();
  const invalidate = () => {
    for (const key of invalidateKeys) void qc.invalidateQueries({ queryKey: [key] });
  };

  const recognitions = useQuery({
    queryKey: ["recognitions", params?.status ?? "all", params?.type ?? "all", params?.period ?? "all"],
    queryFn: () => recognitionService.getAll(params),
  });
  const breakdown = useQuery({
    queryKey: ["recognition-values"],
    queryFn: () => recognitionService.valueBreakdown(),
  });
  const approve = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DecideRecognitionPayload }) =>
      recognitionService.approve(id, data),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DecideRecognitionPayload }) =>
      recognitionService.reject(id, data),
    onSuccess: invalidate,
  });
  return { recognitions, breakdown, approve, reject };
}

/** The public wall + nominating a colleague. */
export function useRecognitionWall(limit = 50) {
  const qc = useQueryClient();
  const wall = useQuery({
    queryKey: ["recognition-wall", limit],
    queryFn: () => recognitionService.wall(limit),
  });
  const nominate = useMutation({
    mutationFn: (data: NominateRecognitionPayload) => recognitionService.nominate(data),
    onSuccess: () => {
      for (const key of invalidateKeys) void qc.invalidateQueries({ queryKey: [key] });
    },
  });
  return { wall, nominate };
}

export function useMyRecognition() {
  return useQuery({
    queryKey: ["my-recognition"],
    queryFn: () => recognitionService.getMine(),
  });
}
