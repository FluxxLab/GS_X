'use client';

import { useState, useCallback } from 'react';
import type { ReviewVendorPrequalificationPayload, VendorPrequalification } from '@/lib/types/finance';

type ReviewStatus = 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

interface Options {
  onReview: (args: { id: string; data: ReviewVendorPrequalificationPayload }) => Promise<unknown>;
}

/** Review-decision state for the vendor-prequalification review modal. */
export function usePrequalificationReview({ onReview }: Options) {
  const [target, setTarget] = useState<VendorPrequalification | null>(null);
  const [status, setStatus] = useState<ReviewStatus>('APPROVED');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const open = useCallback((app: VendorPrequalification) => {
    setTarget(app);
    setStatus(app.status === 'SUBMITTED' ? 'UNDER_REVIEW' : 'APPROVED');
    setNotes('');
    setRejectionReason('');
  }, []);

  const close = useCallback(() => setTarget(null), []);

  const submit = useCallback(async () => {
    if (!target) return;
    try {
      await onReview({
        id: target.id,
        data: {
          status,
          reviewNotes: notes || undefined,
          rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
        },
      });
      setTarget(null);
      setNotes('');
      setRejectionReason('');
    } catch {
      // handled by hook
    }
  }, [target, status, notes, rejectionReason, onReview]);

  return { target, status, setStatus, notes, setNotes, rejectionReason, setRejectionReason, open, close, submit };
}
