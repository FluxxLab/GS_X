'use client';

import { useEffect, useState } from 'react';
import { recruitmentService } from '@/lib/services/recruitment.service';
import type { JobPosting } from '@/lib/types/recruitment';

/** The settled result of a job-posting fetch, tagged with the id it belongs to. */
interface FetchResult {
  id: string;
  job: JobPosting | null;
}

/**
 * Loads a public job posting by id, guarding against stale responses via a
 * settled-result tagged by id (no synchronous setState in the effect body).
 * Mirrors the original page's load behavior: a fetch failure is swallowed
 * (job stays null) and loading resolves either way.
 */
export function useJobPosting(id: string) {
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    recruitmentService
      .getJobById(id)
      .then((data) => {
        if (!cancelled) setResult({ id, job: data });
      })
      .catch(() => {
        if (!cancelled) setResult({ id, job: null });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const settled = result && result.id === id ? result : null;
  const job = settled?.job ?? null;
  // Loading until a settled result arrives. Matches the original page, which
  // started `loading=true` and only cleared it in the fetch's `.finally`.
  const loading = !settled;

  return { job, loading };
}
