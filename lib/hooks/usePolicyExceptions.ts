"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policyExceptionService } from "@/lib/services/policy-exception.service";
import type {
  RequestPolicyExceptionPayload,
  DecidePolicyExceptionPayload,
} from "@/lib/types/policy-exception";

/** HR queue: request → decide in writing. */
export function usePolicyExceptions(params?: { status?: string; policyId?: string }) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["policy-exceptions"] });
    void qc.invalidateQueries({ queryKey: ["my-policy-exceptions"] });
  };

  const exceptions = useQuery({
    queryKey: ["policy-exceptions", params?.status ?? "all", params?.policyId ?? "all"],
    queryFn: () => policyExceptionService.getAll(params),
  });
  const approve = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DecidePolicyExceptionPayload }) =>
      policyExceptionService.approve(id, data),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DecidePolicyExceptionPayload }) =>
      policyExceptionService.reject(id, data),
    onSuccess: invalidate,
  });
  const revoke = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DecidePolicyExceptionPayload }) =>
      policyExceptionService.revoke(id, data),
    onSuccess: invalidate,
  });
  return { exceptions, approve, reject, revoke };
}

/** Employee self-service: my exception requests. */
export function useMyPolicyExceptions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["my-policy-exceptions"] });

  const exceptions = useQuery({
    queryKey: ["my-policy-exceptions"],
    queryFn: () => policyExceptionService.getMine(),
  });
  const request = useMutation({
    mutationFn: (data: RequestPolicyExceptionPayload) => policyExceptionService.request(data),
    onSuccess: invalidate,
  });
  const uploadEvidence = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      policyExceptionService.uploadEvidence(id, file),
    onSuccess: invalidate,
  });
  return { exceptions, request, uploadEvidence };
}

/** Opens the signed S3 URL for the supporting document. */
export async function openExceptionEvidence(id: string): Promise<void> {
  const { url } = await policyExceptionService.downloadUrl(id);
  window.open(url, "_blank", "noopener,noreferrer");
}
