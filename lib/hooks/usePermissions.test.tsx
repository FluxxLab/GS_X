import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../services/permissions.service', () => ({
  permissionsService: {
    getCatalog: vi.fn(),
    getMatrix: vi.fn(),
    setRolePermissions: vi.fn(),
    getMine: vi.fn(),
  },
}));

import { permissionsService } from '../services/permissions.service';
import { usePermissions } from './usePermissions';

const mocked = permissionsService as unknown as Record<string, ReturnType<typeof vi.fn>>;

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

describe('usePermissions', () => {
  it('loads the catalog and matrix', async () => {
    mocked.getCatalog.mockResolvedValue([{ key: 'finance.expenses', label: 'Expenses', group: 'Finance', actions: ['view'] }]);
    mocked.getMatrix.mockResolvedValue({ finance_controller: ['finance.expenses.view'] });

    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.catalog).toHaveLength(1);
    expect(result.current.matrix.finance_controller).toEqual(['finance.expenses.view']);
  });

  it('saveRole forwards (role, permissions) to the service', async () => {
    mocked.getCatalog.mockResolvedValue([]);
    mocked.getMatrix.mockResolvedValue({});
    mocked.setRolePermissions.mockResolvedValue(['sales.reports.view']);

    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.saveRole('employee', ['sales.reports.view']);
    });
    expect(mocked.setRolePermissions).toHaveBeenCalledWith('employee', ['sales.reports.view']);
  });
});
