'use client';

import { useState, useEffect, useCallback } from 'react';
import { lookupService } from '@/lib/services/lookup.service';
import type { Lookup } from '@/lib/types/lookup';

/**
 * Loads finance-settings lookup entries for the active category. Mirrors the
 * original raw-service load (not yet on TanStack Query — flagged for follow-up).
 */
export function useFinanceLookups(category: string) {
  const [items, setItems] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lookupService.getByCategory(category);
      setItems(data);
    } catch {
      setError('Failed to load lookup data.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return { items, loading, error, setError, refresh: fetchItems };
}
