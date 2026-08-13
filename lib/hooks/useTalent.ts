"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { talentService } from "@/lib/services/talent.service";
import { employeeService } from "@/lib/services/employee.service";
import type {
  ScheduleInterviewPayload,
  InterviewFeedbackPayload,
  CreateReferencePayload,
  CreateAppraisalPayload,
  ManagerReviewPayload,
  SelfReviewPayload,
} from "@/lib/types/talent";

export function useEmployeePicker() {
  return useQuery({
    queryKey: ["talent", "employee-picker"],
    queryFn: () => employeeService.getAll({ limit: 200 }),
  });
}

export function useAppraisals(status?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["appraisals"] });

  const appraisals = useQuery({
    queryKey: ["appraisals", status ?? "all"],
    queryFn: () => talentService.listAppraisals(status ? { status } : undefined),
  });
  const create = useMutation({
    mutationFn: (data: CreateAppraisalPayload) => talentService.createAppraisal(data),
    onSuccess: invalidate,
  });
  const managerReview = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ManagerReviewPayload }) => talentService.managerReview(id, data),
    onSuccess: invalidate,
  });
  return { appraisals, create, managerReview };
}

export function useMyAppraisals() {
  const qc = useQueryClient();
  const appraisals = useQuery({
    queryKey: ["appraisals", "mine"],
    queryFn: () => talentService.getMyAppraisals(),
  });
  const selfReview = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SelfReviewPayload }) => talentService.selfReview(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appraisals", "mine"] }),
  });
  return { appraisals, selfReview };
}

export function useInterviews(candidateId?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["interviews"] });

  const interviews = useQuery({
    queryKey: ["interviews", candidateId ?? "all"],
    queryFn: () => talentService.listInterviews(candidateId),
  });
  const references = useQuery({
    queryKey: ["references", candidateId ?? "all"],
    queryFn: () => talentService.listReferences(candidateId),
  });
  const schedule = useMutation({
    mutationFn: (data: ScheduleInterviewPayload) => talentService.scheduleInterview(data),
    onSuccess: invalidate,
  });
  const feedback = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InterviewFeedbackPayload }) => talentService.interviewFeedback(id, data),
    onSuccess: invalidate,
  });
  const addReference = useMutation({
    mutationFn: (data: CreateReferencePayload) => talentService.createReference(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["references"] }),
  });
  return { interviews, references, schedule, feedback, addReference };
}
