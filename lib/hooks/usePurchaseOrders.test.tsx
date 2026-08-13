import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/finance.service', () => ({
  financeService: {
    getPurchaseOrders: vi.fn(),
    createPurchaseOrder: vi.fn(),
    updatePurchaseOrder: vi.fn(),
    deletePurchaseOrder: vi.fn(),
    approvePurchaseOrder: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { usePurchaseOrders } from './usePurchaseOrders';

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

describe('usePurchaseOrders', () => {
  it('defaults to an empty list while loading', () => {
    mocked.getPurchaseOrders.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.purchaseOrders).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('exposes the paginated payload once loaded', async () => {
    mocked.getPurchaseOrders.mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.purchaseOrders).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('createPurchaseOrder forwards the payload to the service', async () => {
    mocked.getPurchaseOrders.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.createPurchaseOrder.mockResolvedValue({ id: 'new' });
    const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() });

    const payload = { vendorId: 'v1', amount: 100 } as never;
    await act(async () => {
      await result.current.createPurchaseOrder(payload);
    });
    expect(mocked.createPurchaseOrder).toHaveBeenCalledWith(payload);
  });

  it('approvePurchaseOrder forwards the id to the service', async () => {
    mocked.getPurchaseOrders.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.approvePurchaseOrder.mockResolvedValue({ id: 'po1' });
    const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.approvePurchaseOrder('po1');
    });
    expect(mocked.approvePurchaseOrder).toHaveBeenCalledWith('po1');
  });

  it('updatePurchaseOrder maps (id, payload) to the service signature', async () => {
    mocked.getPurchaseOrders.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.updatePurchaseOrder.mockResolvedValue({ id: 'po1' });
    const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.updatePurchaseOrder('po1', { amount: 50 } as never);
    });
    expect(mocked.updatePurchaseOrder).toHaveBeenCalledWith('po1', { amount: 50 });
  });
});
