import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../services/employee.service', () => ({
  employeeService: {
    create: vi.fn(),
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../services/department.service', () => ({
  departmentService: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

import { employeeService } from '../services/employee.service';
import { useEmployeeCreateForm } from './useEmployeeCreateForm';

const mocked = employeeService as unknown as Record<string, ReturnType<typeof vi.fn>>;

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function fillRequired(result: { current: ReturnType<typeof useEmployeeCreateForm> }) {
  act(() => {
    result.current.setField('firstName', 'John');
    result.current.setField('lastName', 'Doe');
    result.current.setField('email', 'john.doe@maizube.com');
    result.current.setField('employeeId', 'EMP-001');
    result.current.setField('hireDate', '2026-06-21');
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useEmployeeCreateForm', () => {
  it('does not call create when required fields are empty (zod gate blocks)', async () => {
    const { result } = renderHook(() => useEmployeeCreateForm(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.submit();
    });

    expect(mocked.create).not.toHaveBeenCalled();
    expect(result.current.errors.firstName).toBeTruthy();
  });

  it('submit sends isDraft:false', async () => {
    mocked.create.mockResolvedValue({ id: 'emp1' });
    const { result } = renderHook(() => useEmployeeCreateForm(), { wrapper: createWrapper() });
    fillRequired(result);

    await act(async () => {
      await result.current.submit();
    });

    expect(mocked.create).toHaveBeenCalledTimes(1);
    expect(mocked.create).toHaveBeenCalledWith(expect.objectContaining({ isDraft: false }));
  });

  it('saveDraft sends isDraft:true', async () => {
    mocked.create.mockResolvedValue({ id: 'emp1' });
    const { result } = renderHook(() => useEmployeeCreateForm(), { wrapper: createWrapper() });
    fillRequired(result);

    await act(async () => {
      await result.current.saveDraft();
    });

    expect(mocked.create).toHaveBeenCalledTimes(1);
    expect(mocked.create).toHaveBeenCalledWith(expect.objectContaining({ isDraft: true }));
  });
});
