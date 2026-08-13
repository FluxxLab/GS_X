'use client';

import { useQuery } from '@tanstack/react-query';
import { lookupService } from '../services/lookup.service';
import type { Lookup } from '../types/lookup';

export function useLookups(category: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['lookups', category],
    queryFn: () => lookupService.getByCategory(category),
    enabled: !!category,
  });

  return { items: data ?? [] as Lookup[], loading: isLoading };
}
