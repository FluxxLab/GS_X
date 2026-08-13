import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/finance.service', () => ({
  financeService: {
    getInvoices: vi.fn(),
    createInvoice: vi.fn(),
    updateInvoice: vi.fn(),
    sendInvoice: vi.fn(),
    voidInvoice: vi.fn(),
    deleteInvoice: vi.fn(),
    sendInvoiceReminder: vi.fn(),
    downloadInvoicePdf: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { useInvoices } from './useInvoices';

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

describe('useInvoices', () => {
  it('defaults to an empty list while loading', () => {
    mocked.getInvoices.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useInvoices(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.invoices).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('exposes the paginated payload once loaded', async () => {
    mocked.getInvoices.mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    const { result } = renderHook(() => useInvoices(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoices).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('createInvoice forwards the payload to the service', async () => {
    mocked.getInvoices.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.createInvoice.mockResolvedValue({ id: 'new' });
    const { result } = renderHook(() => useInvoices(), { wrapper: createWrapper() });

    const payload = { customerId: 'c1', amount: 100 } as never;
    await act(async () => {
      await result.current.createInvoice(payload);
    });
    expect(mocked.createInvoice).toHaveBeenCalledWith(payload);
  });

  it('updateInvoice maps (id, payload) to the service signature', async () => {
    mocked.getInvoices.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.updateInvoice.mockResolvedValue({ id: 'i1' });
    const { result } = renderHook(() => useInvoices(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.updateInvoice('i1', { amount: 50 } as never);
    });
    expect(mocked.updateInvoice).toHaveBeenCalledWith('i1', { amount: 50 });
  });

  it('sendInvoice forwards the id to the service', async () => {
    mocked.getInvoices.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.sendInvoice.mockResolvedValue({ id: 'i1' });
    const { result } = renderHook(() => useInvoices(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.sendInvoice('i1');
    });
    expect(mocked.sendInvoice).toHaveBeenCalledWith('i1');
  });
});
