'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../services/finance.service';

/** Year-end close: preview a year's P&L roll and post the close. */
export function useYearEnd(year: number) {
  const queryClient = useQueryClient();

  const preview = useQuery({
    queryKey: ['finance', 'year-end', 'preview', year],
    queryFn: () => financeService.getYearEndPreview(year),
    enabled: !!year,
  });

  const closes = useQuery({
    queryKey: ['finance', 'year-end', 'closes'],
    queryFn: () => financeService.getYearEndCloses(),
  });

  const closeMutation = useMutation({
    mutationFn: (y: number) => financeService.closeYear(y),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'year-end'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
    },
  });

  return {
    preview: preview.data ?? null,
    previewLoading: preview.isLoading,
    closes: closes.data ?? [],
    closesLoading: closes.isLoading,
    closeYear: closeMutation.mutateAsync,
    closing: closeMutation.isPending,
  };
}
