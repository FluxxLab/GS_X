'use client';

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { useState } from 'react';
import { TourProvider } from '@/lib/tour/TourProvider';
import { toast, toErrorMessage } from '@/lib/ui/toast';
import { ApiError, NetworkError } from '@/lib/api/client';

/**
 * A connectivity blip (offline / timeout) is shown as a gentle, auto-dismissing
 * toast and left to retry; only real server errors escalate to the blocking
 * error modal (via toast.error).
 */
function surfaceError(error: unknown) {
  if (error instanceof NetworkError) {
    toast.info(error.message);
  } else {
    toast.error(toErrorMessage(error));
  }
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Global safety net: any mutation/query error that a hook doesn't
        // handle itself surfaces as a toast, so a failed action can never
        // leave the user staring at a screen that silently did nothing.
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) => {
            // Skip when the caller handles its own errors, or opts out.
            if (mutation.options.onError) return;
            if (mutation.meta?.suppressErrorToast) return;
            surfaceError(error);
          },
        }),
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Background fetches are noisy; surface only when asked to.
            if (!query.meta?.showErrorToast) return;
            surfaceError(error);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            // Retry connectivity blips and 5xx a couple of times; never retry a
            // 4xx (it won't succeed) so client mistakes fail fast.
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            // Recover automatically when the connection comes back.
            refetchOnReconnect: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TourProvider>{children}</TourProvider>
    </QueryClientProvider>
  );
}
