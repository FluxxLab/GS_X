import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/finance.service', () => ({
  financeService: {
    getBudgets: vi.fn(),
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
    activateBudget: vi.fn(),
    closeBudget: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { useBudgets } from './useBudgets';

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

describe('useBudgets', () => {
  it('defaults to an empty list while loading', () => {
    mocked.getBudgets.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.budgets).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('exposes the paginated payload once loaded', async () => {
    mocked.getBudgets.mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.budgets).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('createBudget forwards the payload to the service', async () => {
    mocked.getBudgets.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.createBudget.mockResolvedValue({ id: 'new' });
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });

    const payload = { name: 'FY26', amount: 1000 } as never;
    await act(async () => {
      await result.current.createBudget(payload);
    });
    expect(mocked.createBudget).toHaveBeenCalledWith(payload);
  });

  it('activateBudget forwards the id to the service', async () => {
    mocked.getBudgets.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.activateBudget.mockResolvedValue({ id: 'b1' });
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.activateBudget('b1');
    });
    expect(mocked.activateBudget).toHaveBeenCalledWith('b1');
  });

  it('updateBudget maps (id, payload) to the service signature', async () => {
    mocked.getBudgets.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.updateBudget.mockResolvedValue({ id: 'b1' });
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.updateBudget('b1', { amount: 50 } as never);
    });
    expect(mocked.updateBudget).toHaveBeenCalledWith('b1', { amount: 50 });
  });
});
