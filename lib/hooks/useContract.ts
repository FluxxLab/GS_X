'use client';

import { useQuery } from '@tanstack/react-query';
import { contractService } from '@/lib/services/contract.service';

/** Loads a single contract by id (same query key/source as the original page). */
export function useContract(id: string) {
  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contracts', 'detail', id],
    queryFn: () => contractService.getById(id),
    enabled: !!id,
  });
  return { contract, isLoading, error };
}
