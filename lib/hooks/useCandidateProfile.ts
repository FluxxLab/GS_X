'use client';

import { useCallback, useEffect, useState } from 'react';
import { recruitmentService } from '@/lib/services/recruitment.service';
import type { Candidate, CandidateStage, UpdateCandidatePayload } from '@/lib/types/recruitment';
import { CANDIDATE_STAGE_ORDER } from '@/lib/constants/recruitment-candidate';

export interface ProfileToast {
  message: string;
  type: 'success' | 'error';
}

/** The settled result of a fetch, tagged with the id it belongs to. */
interface FetchResult {
  id: string;
  candidate: Candidate | null;
  error: string | null;
}

/**
 * Owns the candidate-profile data lifecycle: load the candidate by id (guarding
 * against stale responses), advance the recruitment stage, schedule/resend
 * interview invites, and submit interview feedback. Mirrors the original page's
 * fetch/update behavior exactly. State is only written from async callbacks
 * (never synchronously in the effect body), so `loading` is derived.
 */
export function useCandidateProfile(candidateId: string | null) {
  const [result, setResult] = useState<FetchResult | null>(null);
  const [toast, setToast] = useState<ProfileToast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;
    recruitmentService
      .getCandidateById(candidateId)
      .then((data) => {
        if (!cancelled) setResult({ id: candidateId, candidate: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            id: candidateId,
            candidate: null,
            error: err instanceof Error ? err.message : 'Failed to load candidate',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  const settled = result && result.id === candidateId ? result : null;
  const candidate = settled?.candidate ?? null;
  // With an id but no settled result for it yet → loading.
  const loading = candidateId ? !settled : false;
  const error = candidateId ? settled?.error ?? null : 'No candidate ID provided';

  const getNextStage = useCallback((): CandidateStage | null => {
    if (!candidate) return null;
    const idx = CANDIDATE_STAGE_ORDER.indexOf(candidate.stage);
    if (idx === -1 || idx >= CANDIDATE_STAGE_ORDER.length - 1) return null;
    return CANDIDATE_STAGE_ORDER[idx + 1];
  }, [candidate]);

  /** Advance to a stage that requires no extra input (interview/shortlisted are gated by modals). */
  const moveStage = useCallback(async (stage: CandidateStage) => {
    if (!candidate) return;
    try {
      const updated = await recruitmentService.moveCandidateStage(candidate.id, stage);
      setResult({ id: candidate.id, candidate: updated, error: null });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to update stage', type: 'error' });
    }
  }, [candidate]);

  const scheduleInterview = useCallback(async (interviewDate: string, interviewNotes: string) => {
    if (!candidate || !interviewDate) return;
    try {
      // First update interview date and notes
      await recruitmentService.updateCandidate(candidate.id, {
        interviewDate,
        interviewNotes: interviewNotes || undefined,
      } as UpdateCandidatePayload);
      // Then move to interview stage (this sends the email)
      const updated = await recruitmentService.moveCandidateStage(candidate.id, 'interview');
      setResult({ id: candidate.id, candidate: updated, error: null });
      return true;
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to schedule interview', type: 'error' });
      return false;
    }
  }, [candidate]);

  const resendInvite = useCallback(async (resendDate: string, resendNotes: string) => {
    if (!candidate || !resendDate) return;
    try {
      const updated = await recruitmentService.resendInterviewInvite(candidate.id, resendDate, resendNotes || undefined);
      setResult({ id: candidate.id, candidate: updated, error: null });
      return true;
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to resend invite', type: 'error' });
      return false;
    }
  }, [candidate]);

  const submitFeedback = useCallback(async (feedbackNotes: string, feedbackRating: number) => {
    if (!candidate || !feedbackNotes.trim()) return;
    try {
      // Save interview notes and rating
      await recruitmentService.updateCandidate(candidate.id, {
        notes: feedbackNotes,
        rating: feedbackRating || undefined,
      } as UpdateCandidatePayload);
      // Then move to shortlisted
      const updated = await recruitmentService.moveCandidateStage(candidate.id, 'shortlisted');
      setResult({
        id: candidate.id,
        candidate: { ...updated, notes: feedbackNotes, rating: feedbackRating || updated.rating },
        error: null,
      });
      return true;
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to submit feedback', type: 'error' });
      return false;
    }
  }, [candidate]);

  return {
    candidate,
    loading,
    error,
    toast,
    setToast,
    getNextStage,
    moveStage,
    scheduleInterview,
    resendInvite,
    submitFeedback,
  };
}
