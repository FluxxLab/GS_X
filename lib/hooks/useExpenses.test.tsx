import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock the service the hook depends on.
vi.mock('../services/finance.service', () => ({
  financeService: {
    getExpenses: vi.fn(),
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
    hodApproveExpense: vi.fn(),
    approveExpense: vi.fn(),
    rejectExpense: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { useExpenses } from './useExpenses';

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

describe('useExpenses', () => {
  it('defaults to an empty list while loading', () => {
    mocked.getExpenses.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useExpenses(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.expenses).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('exposes the paginated payload once loaded', async () => {
    mocked.getExpenses.mockResolvedValue({
      data: [{ id: 'e1' }, { id: 'e2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    const { result } = renderHook(() => useExpenses(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.expenses).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('createExpense forwards the payload to the service', async () => {
    mocked.getExpenses.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.createExpense.mockResolvedValue({ id: 'new' });
    const { result } = renderHook(() => useExpenses(), { wrapper: createWrapper() });

    const payload = { date: '2026-06-21', amount: 100 } as never;
    await act(async () => {
      await result.current.createExpense(payload);
    });
    expect(mocked.createExpense).toHaveBeenCalledWith(payload);
  });

  it('updateExpense maps (id, payload) to the service signature', async () => {
    mocked.getExpenses.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.updateExpense.mockResolvedValue({ id: 'e1' });
    const { result } = renderHook(() => useExpenses(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.updateExpense('e1', { amount: 50 } as never);
    });
    expect(mocked.updateExpense).toHaveBeenCalledWith('e1', { amount: 50 });
  });
});
