import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/finance.service', () => ({
  financeService: {
    getPayments: vi.fn(),
    createPayment: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { usePayments } from './usePayments';

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

describe('usePayments', () => {
  it('defaults to an empty list while loading', () => {
    mocked.getPayments.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.payments).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('exposes the paginated payload once loaded', async () => {
    mocked.getPayments.mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.payments).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('createPayment forwards the payload to the service', async () => {
    mocked.getPayments.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.createPayment.mockResolvedValue({ id: 'new' });
    const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });

    const payload = { invoiceId: 'i1', amount: 100 } as never;
    await act(async () => {
      await result.current.createPayment(payload);
    });
    expect(mocked.createPayment).toHaveBeenCalledWith(payload);
  });
});
