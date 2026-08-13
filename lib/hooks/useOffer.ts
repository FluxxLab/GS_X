'use client';

import { useCallback, useEffect, useState } from 'react';
import { recruitmentService } from '@/lib/services/recruitment.service';
import type { Offer } from '@/lib/types/recruitment';

export type OfferPageState = 'loading' | 'error' | 'offer' | 'accepted' | 'declined';

/** The settled result of an offer fetch, tagged with the token it belongs to. */
interface FetchResult {
  token: string;
  pageState: OfferPageState;
  offer: Offer | null;
  errorMessage: string;
}

/** Map an offer's status to the page state the original page rendered. */
function pageStateFor(offer: Offer): { pageState: OfferPageState; errorMessage: string } {
  if (offer.status === 'accepted') return { pageState: 'accepted', errorMessage: '' };
  if (offer.status === 'rejected') return { pageState: 'declined', errorMessage: '' };
  if (offer.status === 'expired') {
    return { pageState: 'error', errorMessage: 'This offer has expired. Please contact HR for further assistance.' };
  }
  return { pageState: 'offer', errorMessage: '' };
}

/**
 * Owns the public offer's data lifecycle: load the offer by token (guarding
 * against stale responses via a settled-result tagged by token — no synchronous
 * setState in the effect body), load the HR signatory name, and expose the
 * accept / decline actions. Mirrors the original page's behavior exactly.
 */
export function useOffer(token: string) {
  // Single settled-result state tagged with its token. The effect only writes
  // state from async callbacks, so loading is derived: a token with no matching
  // settled result yet means "loading".
  const [result, setResult] = useState<FetchResult | null>(null);
  const [hrManager, setHrManager] = useState<{ firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    recruitmentService
      .getOfferByToken(token)
      .then((data) => {
        if (cancelled) return;
        const { pageState, errorMessage } = pageStateFor(data);
        setResult({ token, pageState, offer: data, errorMessage });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            token,
            pageState: 'error',
            offer: null,
            errorMessage: 'Offer not found or the link is invalid. Please check the URL or contact HR.',
          });
        }
      });
    // Fetch HR manager name for signature
    recruitmentService
      .getHrSignatory()
      .then((data) => { if (!cancelled && data.firstName) setHrManager(data); })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  const settled = result && result.token === token ? result : null;
  const pageState: OfferPageState = settled ? settled.pageState : 'loading';
  const offer = settled?.offer ?? null;
  const errorMessage = settled?.errorMessage ?? '';

  const acceptOffer = useCallback(
    async (signatureDataUrl: string | null) => {
      await recruitmentService.acceptOffer(token, signatureDataUrl || undefined);
      setResult((prev) => (prev ? { ...prev, pageState: 'accepted', errorMessage: '' } : prev));
    },
    [token],
  );

  const declineOffer = useCallback(
    async (declineReason: string) => {
      await recruitmentService.rejectOffer(token, declineReason || undefined);
      setResult((prev) => (prev ? { ...prev, pageState: 'declined', errorMessage: '' } : prev));
    },
    [token],
  );

  return { pageState, offer, errorMessage, hrManager, acceptOffer, declineOffer };
}
