'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';
import type {
  PrequalificationQueryParams,
  CreateVendorPrequalificationPayload,
  ReviewVendorPrequalificationPayload,
  PrequalificationStats,
} from '../types/finance';

export function usePrequalifications(params?: PrequalificationQueryParams) {
  const qc = useQueryClient();
  const key = ['finance', 'prequalifications', params];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => financeService.getPrequalifications(params),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['finance', 'prequalification-stats'],
    queryFn: () => financeService.getPrequalificationStats(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['finance', 'prequalifications'] });
    qc.invalidateQueries({ queryKey: ['finance', 'prequalification-stats'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateVendorPrequalificationPayload) => financeService.createPrequalification(data),
    onSuccess: invalidate,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewVendorPrequalificationPayload }) =>
      financeService.reviewPrequalification(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deletePrequalification(id),
    onSuccess: invalidate,
  });

  return {
    applications: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    stats: stats
      ? (() => {
          // Backend may return upper- or lower-cased status keys; accept both.
          const s = stats as PrequalificationStats & Partial<Record<'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED', number>>;
          return { submitted: s.SUBMITTED ?? s.submitted ?? 0, underReview: s.UNDER_REVIEW ?? s.underReview ?? 0, approved: s.APPROVED ?? s.approved ?? 0, rejected: s.REJECTED ?? s.rejected ?? 0, total: s.total ?? 0 };
        })()
      : { submitted: 0, underReview: 0, approved: 0, rejected: 0, total: 0 },
    statsLoading,
    createApplication: createMutation.mutateAsync,
    creating: createMutation.isPending,
    reviewApplication: reviewMutation.mutateAsync,
    reviewing: reviewMutation.isPending,
    deleteApplication: deleteMutation.mutateAsync,
  };
}
