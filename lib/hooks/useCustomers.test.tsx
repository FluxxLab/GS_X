import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/finance.service', () => ({
  financeService: {
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { useCustomers } from './useCustomers';

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

describe('useCustomers', () => {
  it('defaults to an empty list while loading', () => {
    mocked.getCustomers.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.customers).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('exposes the paginated payload once loaded', async () => {
    mocked.getCustomers.mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.customers).toHaveLength(2);
    expect(result.current.total).toBe(2);
  });

  it('createCustomer forwards the payload to the service', async () => {
    mocked.getCustomers.mockResolvedValue({ data: [], total: 0 });
    mocked.createCustomer.mockResolvedValue({ id: 'new' });
    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() });

    const payload = { name: 'Acme', email: 'a@b.com' } as never;
    await act(async () => {
      await result.current.createCustomer(payload);
    });
    expect(mocked.createCustomer).toHaveBeenCalledWith(payload);
  });

  it('updateCustomer maps (id, payload) to the service signature', async () => {
    mocked.getCustomers.mockResolvedValue({ data: [], total: 0 });
    mocked.updateCustomer.mockResolvedValue({ id: 'c1' });
    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.updateCustomer('c1', { name: 'New' } as never);
    });
    expect(mocked.updateCustomer).toHaveBeenCalledWith('c1', { name: 'New' });
  });

  it('deleteCustomer forwards the id to the service', async () => {
    mocked.getCustomers.mockResolvedValue({ data: [], total: 0 });
    mocked.deleteCustomer.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.deleteCustomer('c1');
    });
    expect(mocked.deleteCustomer).toHaveBeenCalledWith('c1');
  });
});
