import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/finance.service', () => ({
  financeService: {
    getAuditLogs: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { useAuditLogs } from './useAuditLogs';

const mocked = financeService as unknown as Record<string, ReturnType<typeof vi.fn>>;

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAuditLogs', () => {
  it('defaults to an empty list while loading', () => {
    mocked.getAuditLogs.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.logs).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('shapes the paginated payload once loaded', async () => {
    mocked.getAuditLogs.mockResolvedValue({
      data: [{ id: 'a1' }, { id: 'a2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.logs).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });
});
