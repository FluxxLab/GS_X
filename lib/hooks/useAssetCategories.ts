'use client';

import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/lib/services/lookup.service';
import { ASSET_CATEGORIES } from '@/lib/constants/asset';

export interface AssetCategoryOption {
  value: string;
  label: string;
}

/**
 * Admin-managed fixed-asset categories (the `asset_category` lookups). Falls
 * back to the built-in constant if the lookups haven't been seeded yet or the
 * request fails, so dropdowns always have options. Active entries only, ordered
 * by the lookup `sortOrder`.
 */
export function useAssetCategories(): {
  categories: AssetCategoryOption[];
  loading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['lookups', 'asset_category'],
    queryFn: () => lookupService.getByCategory('asset_category'),
    staleTime: 5 * 60 * 1000,
  });

  const fromApi = (data ?? [])
    .filter((l) => l.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((l) => ({ value: l.value, label: l.label }));

  return {
    categories: fromApi.length > 0 ? fromApi : ASSET_CATEGORIES,
    loading: isLoading,
  };
}
