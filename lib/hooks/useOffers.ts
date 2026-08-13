'use client';

import { useCallback, useEffect, useState } from 'react';
import { recruitmentService } from '@/lib/services/recruitment.service';
import { departmentService } from '@/lib/services/department.service';
import type { Offer, Candidate, JobPosting, PaginatedResponse, UpdateOfferPayload } from '@/lib/types/recruitment';
import type { Department, PaginatedResponse as DeptPaginatedResponse } from '@/lib/types/department';

export interface OffersToast {
  type: 'success' | 'error';
  message: string;
}

/**
 * Owns the offers list data lifecycle: fetch all offers, load the modal
 * dropdown data (candidates / job postings / departments), and the row-level
 * actions (resend offer letter, withdraw, review change request). Mirrors the
 * original page's fetch/action behavior exactly.
 */
export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For modal dropdowns
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [toast, setToast] = useState<OffersToast | null>(null);

  const showToast = useCallback((t: OffersToast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Manual refresh: re-enters the loading state and re-fetches (used after a
  // create/edit/withdraw/resend). The initial load is the effect below, which
  // relies on `loading` already being `true` so it never sets state in the
  // effect body (avoids the cascading-render warning).
  const fetchOffers = useCallback(() => {
    setLoading(true);
    recruitmentService.getAllOffers()
      .then((data) => setOffers(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load offers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    recruitmentService.getAllOffers()
      .then((data) => { if (!cancelled) setOffers(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load offers'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    // Fetch dropdown data for modal
    Promise.all([
      recruitmentService.getAllCandidates({ page: 1, limit: 200, sortBy: 'createdAt', sortOrder: 'DESC' }),
      recruitmentService.getAllJobs({ page: 1, limit: 200, sortBy: 'title', sortOrder: 'ASC' }),
      departmentService.getAll({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'ASC' }),
    ]).then(([cData, jData, dData]: [PaginatedResponse<Candidate>, PaginatedResponse<JobPosting>, DeptPaginatedResponse<Department>]) => {
      if (cancelled) return;
      setCandidates(cData.data);
      setJobPostings(jData.data);
      setDepartments(dData.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const resendOffer = useCallback(async (id: string) => {
    try {
      await recruitmentService.resendOfferEmail(id);
      fetchOffers();
      showToast({ type: 'success', message: 'Offer letter resent successfully' });
    } catch (err) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to resend offer' });
    }
  }, [fetchOffers, showToast]);

  const withdrawOffer = useCallback(async (id: string) => {
    try {
      await recruitmentService.updateOffer(id, { status: 'withdrawn' } as UpdateOfferPayload);
      fetchOffers();
      showToast({ type: 'success', message: 'Offer withdrawn successfully' });
    } catch (err) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to withdraw offer' });
    }
  }, [fetchOffers, showToast]);

  const reviewChangeRequest = useCallback(async (id: string, action: 'accept' | 'dismiss') => {
    try {
      await recruitmentService.reviewChangeRequest(id, action);
      fetchOffers();
    } catch { /* ignore */ }
  }, [fetchOffers]);

  return {
    offers,
    loading,
    error,
    candidates,
    jobPostings,
    departments,
    toast,
    setToast,
    fetchOffers,
    resendOffer,
    withdrawOffer,
    reviewChangeRequest,
  };
}
