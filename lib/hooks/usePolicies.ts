"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policyService } from "@/lib/services/policy.service";
import { departmentService } from "@/lib/services/department.service";
import type {
  CreatePolicyPayload,
  UpdatePolicyPayload,
  NewPolicyVersionPayload,
  AddPolicyReferencePayload,
} from "@/lib/types/policy";

/** Departments for the audience picker — unpaginated, unlike useDepartments. */
export function useDepartmentPicker() {
  return useQuery({
    queryKey: ["policies", "department-picker"],
    queryFn: () => departmentService.getAll({ limit: 200 }),
  });
}

/** HR-side library list + create. */
export function usePolicies(params?: { status?: string; category?: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["policies"] });

  const policies = useQuery({
    queryKey: ["policies", params?.status ?? "all", params?.category ?? "all"],
    queryFn: () => policyService.getAll(params),
  });
  const create = useMutation({
    mutationFn: (data: CreatePolicyPayload) => policyService.create(data),
    onSuccess: invalidate,
  });
  return { policies, create };
}

/** One policy + every action available on it. */
export function usePolicy(id: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["policy", id] });
    void qc.invalidateQueries({ queryKey: ["policies"] });
    void qc.invalidateQueries({ queryKey: ["policy-compliance", id] });
  };

  const policy = useQuery({
    queryKey: ["policy", id],
    queryFn: () => policyService.getOne(id),
    enabled: !!id,
  });

  const compliance = useQuery({
    queryKey: ["policy-compliance", id],
    queryFn: () => policyService.compliance(id),
    enabled: !!id && policy.data?.status === "published",
  });

  const update = useMutation({
    mutationFn: (data: UpdatePolicyPayload) => policyService.update(id, data),
    onSuccess: invalidate,
  });
  const uploadFile = useMutation({
    mutationFn: (file: File) => policyService.uploadFile(id, file),
    onSuccess: invalidate,
  });
  const submit = useMutation({
    mutationFn: () => policyService.submit(id),
    onSuccess: invalidate,
  });
  const approveStep = useMutation({
    mutationFn: ({ approvalId, note }: { approvalId: string; note?: string }) =>
      policyService.approveStep(id, approvalId, note),
    onSuccess: invalidate,
  });
  const rejectStep = useMutation({
    mutationFn: ({ approvalId, note }: { approvalId: string; note?: string }) =>
      policyService.rejectStep(id, approvalId, note),
    onSuccess: invalidate,
  });
  const publish = useMutation({
    mutationFn: () => policyService.publish(id),
    onSuccess: invalidate,
  });
  const newVersion = useMutation({
    mutationFn: (data: NewPolicyVersionPayload) => policyService.newVersion(id, data),
    onSuccess: invalidate,
  });
  const archive = useMutation({
    mutationFn: () => policyService.archive(id),
    onSuccess: invalidate,
  });
  const addReference = useMutation({
    mutationFn: (data: AddPolicyReferencePayload) => policyService.addReference(id, data),
    onSuccess: () => {
      invalidate();
      void qc.invalidateQueries({ queryKey: ["dangling-references"] });
    },
  });
  const removeReference = useMutation({
    mutationFn: (referenceId: string) => policyService.removeReference(id, referenceId),
    onSuccess: () => {
      invalidate();
      void qc.invalidateQueries({ queryKey: ["dangling-references"] });
    },
  });

  return {
    policy,
    compliance,
    update,
    uploadFile,
    submit,
    approveStep,
    rejectStep,
    publish,
    newVersion,
    archive,
    addReference,
    removeReference,
  };
}

/** Citations across the library that point at policies nobody has written. */
export function useDanglingReferences() {
  return useQuery({
    queryKey: ["dangling-references"],
    queryFn: () => policyService.danglingReferences(),
  });
}

/** Employee self-service: the policies that apply to me. */
export function useMyPolicies() {
  const qc = useQueryClient();

  const policies = useQuery({
    queryKey: ["my-policies"],
    queryFn: () => policyService.getMine(),
  });
  const acknowledge = useMutation({
    mutationFn: (id: string) => policyService.acknowledge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-policies"] }),
  });
  return { policies, acknowledge };
}

/** Opens the signed S3 URL in a new tab. */
export async function openPolicyDocument(id: string, version?: string): Promise<void> {
  const { url } = await policyService.downloadUrl(id, version);
  window.open(url, "_blank", "noopener,noreferrer");
}
