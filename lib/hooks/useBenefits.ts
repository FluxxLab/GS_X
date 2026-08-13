"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { benefitService } from "@/lib/services/benefit.service";
import { employeeService } from "@/lib/services/employee.service";
import type {
  UpsertBenefitPlanPayload,
  CreateEnrollmentPayload,
} from "@/lib/types/benefit";

export function useBenefitPlans(activeOnly = false) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["benefit-plans"] });

  const plans = useQuery({
    queryKey: ["benefit-plans", activeOnly],
    queryFn: () => benefitService.getPlans(activeOnly),
  });
  const create = useMutation({
    mutationFn: (data: UpsertBenefitPlanPayload) => benefitService.createPlan(data),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpsertBenefitPlanPayload }) => benefitService.updatePlan(id, data),
    onSuccess: invalidate,
  });
  return { plans, create, update };
}

export function useEnrollments(status?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["enrollments"] });

  const enrollments = useQuery({
    queryKey: ["enrollments", status ?? "all"],
    queryFn: () => benefitService.getEnrollments(status ? { status } : undefined),
  });
  const activePlans = useQuery({
    queryKey: ["benefit-plans", "active-picker"],
    queryFn: () => benefitService.getPlans(true),
  });
  const employees = useQuery({
    queryKey: ["enrollments", "employee-picker"],
    queryFn: () => employeeService.getAll({ limit: 200 }),
  });
  const enroll = useMutation({
    mutationFn: (data: CreateEnrollmentPayload) => benefitService.enroll(data),
    onSuccess: invalidate,
  });
  const terminate = useMutation({
    mutationFn: (id: string) => benefitService.terminate(id),
    onSuccess: invalidate,
  });
  return { enrollments, activePlans, employees, enroll, terminate };
}

export function useMyBenefits() {
  return useQuery({
    queryKey: ["benefits", "mine"],
    queryFn: () => benefitService.getMine(),
  });
}
