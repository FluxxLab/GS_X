'use client';

import { useCallback, useEffect, useState } from 'react';
import { userService } from '@/lib/services/user.service';
import type { User, UpdateUserPayload } from '@/lib/types/user';

/** The settled result of a fetch, tagged with the id it belongs to. */
interface FetchResult {
  id: string;
  user: User | null;
  error: string | null;
}

/**
 * Owns the user-profile data lifecycle: load the user by id (guarding against
 * stale responses) and persist edits. Mirrors the original page's fetch/update
 * behavior exactly. State is only written from async callbacks (never
 * synchronously in the effect body), so loading is derived.
 */
export function useUserProfile(userId: string | null) {
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    userService
      .getById(userId)
      .then((data) => {
        if (!cancelled) setResult({ id: userId, user: data, error: null });
      })
      .catch(() => {
        if (!cancelled) setResult({ id: userId, user: null, error: 'Failed to load user profile' });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const settled = result && result.id === userId ? result : null;
  const user = settled?.user ?? null;
  // No id → not loading, surface the error immediately (original behavior).
  // With an id but no settled result for it yet → loading.
  const loading = userId ? !settled : false;
  const error = userId ? settled?.error ?? null : 'No user ID provided';

  const saveUser = useCallback(
    async (payload: UpdateUserPayload): Promise<User> => {
      if (!userId) throw new Error('No user ID provided');
      const updated = await userService.update(userId, payload);
      setResult({ id: userId, user: updated, error: null });
      return updated;
    },
    [userId],
  );

  return { user, loading, error, saveUser };
}
