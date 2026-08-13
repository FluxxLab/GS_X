import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../services/operations.service', () => ({
  operationsService: {
    createProject: vi.fn(),
  },
}));

vi.mock('../services/department.service', () => ({
  departmentService: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../services/employee.service', () => ({
  employeeService: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

import { operationsService } from '../services/operations.service';
import { useProjectForm } from './useProjectForm';

const mocked = operationsService as unknown as Record<string, ReturnType<typeof vi.fn>>;

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

describe('useProjectForm', () => {
  it('does not call createProject when required fields are empty (zod gate blocks)', async () => {
    const { result } = renderHook(() => useProjectForm(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.submit();
    });

    expect(mocked.createProject).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBeTruthy();
  });

  it('calls createProject with the built payload and maps priority Low → LOW', async () => {
    mocked.createProject.mockResolvedValue({ id: 'p1' });
    const { result } = renderHook(() => useProjectForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.setField('name', 'Pipeline Phase 3');
      result.current.setField('projectManagerId', '11111111-1111-1111-1111-111111111111');
      result.current.setField('startDate', '2026-06-21');
      result.current.setField('targetEndDate', '2026-12-31');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mocked.createProject).toHaveBeenCalledTimes(1);
    expect(mocked.createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pipeline Phase 3',
        projectManagerId: '11111111-1111-1111-1111-111111111111',
        startDate: '2026-06-21',
        targetEndDate: '2026-12-31',
        priority: 'LOW',
      }),
    );
  });
});
