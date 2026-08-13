'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/auth.service';
import { separationService } from '@/lib/services/separation.service';

/**
 * Resolves the current user's active separation id (self-service scoping):
 * searches separations by the logged-in user's full name and takes the first
 * match. Behavior preserved byte-for-byte from the original `my-exit` page.
 */
export function useMyExit() {
  const [separationId, setSeparationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function findMySeparation() {
      try {
        // Try to find an active separation for the current user
        const user = authService.getUser();
        const searchName = user ? `${user.firstName} ${user.lastName}` : '';
        const res = await separationService.getAll({ search: searchName, limit: 1 });
        if (cancelled) return;

        if (res.data && res.data.length > 0) {
          setSeparationId(res.data[0].id);
        }
      } catch {
        if (!cancelled) setError('Failed to load separation data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    findMySeparation();
    return () => {
      cancelled = true;
    };
  }, []);

  return { separationId, loading, error };
}
