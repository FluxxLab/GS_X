import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/finance.service', () => ({
  financeService: {
    getAccounts: vi.fn(),
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { useAccounts } from './useAccounts';

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

describe('useAccounts data shaping', () => {
  it('handles a flat array response', async () => {
    mocked.getAccounts.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
    const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.accounts).toHaveLength(2);
    expect(result.current.total).toBe(2);
  });

  it('handles a paginated { data, total } envelope', async () => {
    mocked.getAccounts.mockResolvedValue({ data: [{ id: 'a1' }], total: 9 });
    const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.accounts).toHaveLength(1);
    expect(result.current.total).toBe(9);
  });

  it('defaults to an empty list while loading', () => {
    mocked.getAccounts.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });
    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});
