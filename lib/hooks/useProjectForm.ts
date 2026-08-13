'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { operationsService } from '@/lib/services/operations.service';
import { departmentService } from '@/lib/services/department.service';
import { employeeService } from '@/lib/services/employee.service';
import type { CreateProjectPayload, ProjectPriority } from '@/lib/types/operations';
import { createProjectSchema } from '@/lib/validation/operations';
import { zodFieldErrors } from '@/lib/validation/helpers';
import type { Priority } from '@/lib/constants/project-new';

/** Display priority labels (page UI) → backend ProjectPriority enum. */
const PRIORITY_TO_API: Record<Priority, ProjectPriority> = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
};

export interface ProjectFormValues {
  name: string;
  budgetAmount: string;
  departmentId: string;
  projectManagerId: string;
  startDate: string;
  targetEndDate: string;
  priority: Priority;
  description: string;
}

const EMPTY: ProjectFormValues = {
  name: '',
  budgetAmount: '',
  departmentId: '',
  projectManagerId: '',
  startDate: '',
  targetEndDate: '',
  priority: 'Low',
  description: '',
};

/**
 * Create-project form: single values object + zod validation at the boundary
 * (DTO required fields only) + a TanStack create mutation that redirects to the
 * project list on success.
 */
export function useProjectForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ProjectFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(EMPTY);
    setErrors({});
  }, []);

  // Real departments for the Department dropdown. The form submits the
  // department id; the backend resolves and stores the display name.
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', { limit: 100 }],
    queryFn: () => departmentService.getAll({ limit: 100 }),
  });
  const departments = useMemo(
    () => (departmentsData?.data ?? []).map((d) => ({ id: d.id, name: d.name })),
    [departmentsData],
  );

  // Real employees for the Project Manager dropdown. The form submits the
  // employee id; the backend resolves and stores the full name.
  const { data: employeesData } = useQuery({
    queryKey: ['employees', { limit: 100 }],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });
  const managers = useMemo(
    () =>
      (employeesData?.data ?? []).map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
      })),
    [employeesData],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => operationsService.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'projects'] });
      router.push('/dashboard/projects');
    },
  });

  const submit = useCallback(async () => {
    // The dropdowns lead with an empty-value placeholder; '' means unselected.
    const managerId = values.projectManagerId.trim();
    const departmentId = values.departmentId.trim();

    const parsed = createProjectSchema.safeParse({
      name: values.name,
      projectManagerId: managerId,
      startDate: values.startDate,
      targetEndDate: values.targetEndDate,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    const budget = values.budgetAmount.trim() ? Number(values.budgetAmount) : undefined;

    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        projectManagerId: managerId,
        startDate: values.startDate,
        targetEndDate: values.targetEndDate,
        priority: PRIORITY_TO_API[values.priority],
        departmentId: departmentId || undefined,
        budgetAmount: budget !== undefined && Number.isFinite(budget) ? budget : undefined,
        description: values.description.trim() || undefined,
      });
    } catch {
      /* surfaced via createMutation.isError; inline errors handle validation */
    }
  }, [values, createMutation]);

  return {
    values,
    setField,
    errors,
    reset,
    submit,
    departments,
    managers,
    creating: createMutation.isPending,
  };
}
