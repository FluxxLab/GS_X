'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentService } from '../services/recruitment.service';
import type {
  JobPosting,
  Candidate,
  RecruitmentStats,
  JobPostingQueryParams,
  CandidateQueryParams,
  CandidateStage,
  CreateJobPostingPayload,
  UpdateJobPostingPayload,
  CreateCandidatePayload,
  UpdateCandidatePayload,
} from '../types/recruitment';

// ─── useJobPostings ──────────────────────────────────────────────────────────

interface UseJobPostingsReturn {
  jobs: JobPosting[];
  stats: RecruitmentStats | null;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  loading: boolean;
  error: string | null;
  query: JobPostingQueryParams;
  setQuery: (params: Partial<JobPostingQueryParams>) => void;
  createJob: (data: CreateJobPostingPayload) => Promise<JobPosting>;
  updateJob: (id: string, data: UpdateJobPostingPayload) => Promise<JobPosting>;
  deleteJob: (id: string) => Promise<void>;
  refresh: () => void;
}

const DEFAULT_JOB_QUERY: JobPostingQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export function useJobPostings(): UseJobPostingsReturn {
  const queryClient = useQueryClient();
  const [query, setQueryState] = useState<JobPostingQueryParams>(DEFAULT_JOB_QUERY);

  const setQuery = useCallback((params: Partial<JobPostingQueryParams>) => {
    setQueryState((prev) => ({ ...prev, ...params }));
  }, []);

  // Fetch job postings list
  const {
    data: jobsData,
    isLoading: loadingJobs,
    error: jobsError,
  } = useQuery({
    queryKey: ['jobPostings', query],
    queryFn: () => recruitmentService.getAllJobs(query),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['jobPostings', 'stats'],
    queryFn: () => recruitmentService.getStats(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateJobPostingPayload) => recruitmentService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobPostingPayload }) => recruitmentService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recruitmentService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
  });

  return {
    jobs: jobsData?.data ?? [],
    stats: stats ?? null,
    pagination: {
      total: jobsData?.total ?? 0,
      page: jobsData?.page ?? 1,
      limit: jobsData?.limit ?? 10,
      totalPages: jobsData?.totalPages ?? 0,
    },
    loading: loadingJobs,
    error: jobsError?.message ?? null,
    query,
    setQuery,
    createJob: (data: CreateJobPostingPayload) => createMutation.mutateAsync(data),
    updateJob: (id: string, data: UpdateJobPostingPayload) => updateMutation.mutateAsync({ id, data }),
    deleteJob: (id: string) => deleteMutation.mutateAsync(id).then(() => undefined),
    refresh: () => queryClient.invalidateQueries({ queryKey: ['jobPostings'] }),
  };
}

// ─── useCandidates ───────────────────────────────────────────────────────────

interface UseCandidatesReturn {
  candidates: Candidate[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  loading: boolean;
  error: string | null;
  query: CandidateQueryParams;
  setQuery: (params: Partial<CandidateQueryParams>) => void;
  createCandidate: (data: CreateCandidatePayload) => Promise<Candidate>;
  updateCandidate: (id: string, data: UpdateCandidatePayload) => Promise<Candidate>;
  moveCandidateStage: (id: string, stage: CandidateStage) => Promise<Candidate>;
  deleteCandidate: (id: string) => Promise<void>;
  refresh: () => void;
}

const DEFAULT_CANDIDATE_QUERY: CandidateQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export function useCandidates(jobPostingId?: string): UseCandidatesReturn {
  const queryClient = useQueryClient();
  const [query, setQueryState] = useState<CandidateQueryParams>({
    ...DEFAULT_CANDIDATE_QUERY,
    ...(jobPostingId ? { jobPostingId } : {}),
  });

  const setQuery = useCallback((params: Partial<CandidateQueryParams>) => {
    setQueryState((prev) => ({ ...prev, ...params }));
  }, []);

  // Fetch candidates list
  const {
    data: candidatesData,
    isLoading: loadingCandidates,
    error: candidatesError,
  } = useQuery({
    queryKey: ['candidates', query],
    queryFn: () => recruitmentService.getAllCandidates(query),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCandidatePayload) => recruitmentService.createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCandidatePayload }) => recruitmentService.updateCandidate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  // Move stage mutation
  const moveStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: CandidateStage }) => recruitmentService.moveCandidateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recruitmentService.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  return {
    candidates: candidatesData?.data ?? [],
    pagination: {
      total: candidatesData?.total ?? 0,
      page: candidatesData?.page ?? 1,
      limit: candidatesData?.limit ?? 10,
      totalPages: candidatesData?.totalPages ?? 0,
    },
    loading: loadingCandidates,
    error: candidatesError?.message ?? null,
    query,
    setQuery,
    createCandidate: (data: CreateCandidatePayload) => createMutation.mutateAsync(data),
    updateCandidate: (id: string, data: UpdateCandidatePayload) => updateMutation.mutateAsync({ id, data }),
    moveCandidateStage: (id: string, stage: CandidateStage) => moveStageMutation.mutateAsync({ id, stage }),
    deleteCandidate: (id: string) => deleteMutation.mutateAsync(id).then(() => undefined),
    refresh: () => queryClient.invalidateQueries({ queryKey: ['candidates'] }),
  };
}
