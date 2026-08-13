"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrCaseService } from "@/lib/services/hr-case.service";
import { employeeService } from "@/lib/services/employee.service";
import type {
  CreateDisciplinaryPayload,
  UpdateDisciplinaryPayload,
  CreateGrievancePayload,
  SelfCreateGrievancePayload,
  UpdateGrievancePayload,
} from "@/lib/types/hr-case";

export function useEmployeePicker() {
  return useQuery({
    queryKey: ["hr-cases", "employee-picker"],
    queryFn: () => employeeService.getAll({ limit: 200 }),
  });
}

export function useDisciplinaryCases(status?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["disciplinary"] });

  const cases = useQuery({
    queryKey: ["disciplinary", status ?? "all"],
    queryFn: () => hrCaseService.getDisciplinary(status ? { status } : undefined),
  });
  const create = useMutation({
    mutationFn: (data: CreateDisciplinaryPayload) => hrCaseService.createDisciplinary(data),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDisciplinaryPayload }) => hrCaseService.updateDisciplinary(id, data),
    onSuccess: invalidate,
  });
  const appeal = useMutation({
    mutationFn: ({ id, appealNote }: { id: string; appealNote: string }) => hrCaseService.appealDisciplinary(id, appealNote),
    onSuccess: invalidate,
  });
  const resolveAppeal = useMutation({
    mutationFn: ({ id, appealOutcome }: { id: string; appealOutcome: string }) => hrCaseService.resolveAppeal(id, { appealOutcome }),
    onSuccess: invalidate,
  });
  return { cases, create, update, appeal, resolveAppeal };
}

export function useGrievances(status?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["grievances"] });

  const cases = useQuery({
    queryKey: ["grievances", status ?? "all"],
    queryFn: () => hrCaseService.getGrievances(status ? { status } : undefined),
  });
  const create = useMutation({
    mutationFn: (data: CreateGrievancePayload) => hrCaseService.createGrievance(data),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGrievancePayload }) => hrCaseService.updateGrievance(id, data),
    onSuccess: invalidate,
  });
  return { cases, create, update };
}

/** Self-service: the signed-in employee's own grievances + a raise-for-self mutation. */
export function useMyGrievances() {
  const qc = useQueryClient();
  const cases = useQuery({
    queryKey: ["grievances", "mine"],
    queryFn: () => hrCaseService.getMyGrievances(),
  });
  const create = useMutation({
    mutationFn: (data: SelfCreateGrievancePayload) => hrCaseService.createMyGrievance(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grievances", "mine"] }),
  });
  return { cases, create };
}
