import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/finance.service', () => ({
  financeService: {
    getPaymentVouchers: vi.fn(),
    createPaymentVoucher: vi.fn(),
    submitPV: vi.fn(),
    verifyPVDocuments: vi.fn(),
    hodApprovePV: vi.fn(),
    mdApprovePV: vi.fn(),
    financeReviewPV: vi.fn(),
    processPV: vi.fn(),
    rejectPV: vi.fn(),
    deletePV: vi.fn(),
  },
}));

import { financeService } from '../services/finance.service';
import { usePaymentVouchers } from './usePaymentVouchers';

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

describe('usePaymentVouchers', () => {
  it('defaults to an empty list while loading', () => {
    mocked.getPaymentVouchers.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePaymentVouchers(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.vouchers).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('exposes the paginated payload once loaded', async () => {
    mocked.getPaymentVouchers.mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    });
    const { result } = renderHook(() => usePaymentVouchers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.vouchers).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('createPV forwards the payload to the service', async () => {
    mocked.getPaymentVouchers.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.createPaymentVoucher.mockResolvedValue({ id: 'new' });
    const { result } = renderHook(() => usePaymentVouchers(), { wrapper: createWrapper() });

    const payload = { vendorName: 'Acme', amount: 100 } as never;
    await act(async () => {
      await result.current.createPV(payload);
    });
    expect(mocked.createPaymentVoucher).toHaveBeenCalledWith(payload);
  });

  it('hodApprovePV calls financeService.hodApprovePV with the id', async () => {
    mocked.getPaymentVouchers.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.hodApprovePV.mockResolvedValue({ id: 'pv1' });
    const { result } = renderHook(() => usePaymentVouchers(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.hodApprovePV('pv1');
    });
    expect(mocked.hodApprovePV).toHaveBeenCalledWith('pv1');
  });

  it('mdApprovePV calls financeService.mdApprovePV with the id', async () => {
    mocked.getPaymentVouchers.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.mdApprovePV.mockResolvedValue({ id: 'pv2' });
    const { result } = renderHook(() => usePaymentVouchers(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mdApprovePV('pv2');
    });
    expect(mocked.mdApprovePV).toHaveBeenCalledWith('pv2');
  });

  it('processPV calls financeService.processPV with the id', async () => {
    mocked.getPaymentVouchers.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.processPV.mockResolvedValue({ id: 'pv3' });
    const { result } = renderHook(() => usePaymentVouchers(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.processPV('pv3');
    });
    expect(mocked.processPV).toHaveBeenCalledWith('pv3');
  });

  it('verifyDocuments maps (id, docs) to the service signature', async () => {
    mocked.getPaymentVouchers.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.verifyPVDocuments.mockResolvedValue({ id: 'pv4' });
    const { result } = renderHook(() => usePaymentVouchers(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.verifyDocuments('pv4', { poVerified: true });
    });
    expect(mocked.verifyPVDocuments).toHaveBeenCalledWith('pv4', { poVerified: true });
  });

  it('rejectPV maps (id, reason) to the service signature', async () => {
    mocked.getPaymentVouchers.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });
    mocked.rejectPV.mockResolvedValue({ id: 'pv5' });
    const { result } = renderHook(() => usePaymentVouchers(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.rejectPV('pv5', 'missing docs');
    });
    expect(mocked.rejectPV).toHaveBeenCalledWith('pv5', 'missing docs');
  });
});
