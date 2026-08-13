'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/lib/services/employee.service';
import { departmentService } from '@/lib/services/department.service';
import type { CreateEmployeePayload } from '@/lib/types/employee';
import { createEmployeeSchema } from '@/lib/validation/hr';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  hireDate: string;
  /** Real department UUID (from the departments lookup), or '' when unselected. */
  departmentId: string;
  /** Real manager (employee) UUID (from the employees lookup), or '' when unselected. */
  managerId: string;
  jobLevel: string;
  salaryGrade: string;
}

const EMPTY: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  employeeId: '',
  hireDate: '',
  departmentId: '',
  managerId: '',
  jobLevel: '',
  salaryGrade: '',
};

/**
 * Create-employee form for the Add New Employee page: a single values object +
 * zod validation at the boundary (DTO required fields only) + a TanStack create
 * mutation that redirects to the employee list on success. Mirrors
 * `useProjectForm`.
 *
 * Also exposes the real department lookup so the Department dropdown can submit
 * a genuine `departmentId` UUID (the DTO requires a UUID, not a name).
 */
export function useEmployeeCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<EmployeeFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setValues(EMPTY);
    setErrors({});
  }, []);

  // Real departments for the Department dropdown → real UUID submission.
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', { limit: 100 }],
    queryFn: () => departmentService.getAll({ limit: 100 }),
  });
  const departments = useMemo(
    () => (departmentsData?.data ?? []).map((d) => ({ id: d.id, name: d.name })),
    [departmentsData],
  );

  // Real employees for the Reporting Manager dropdown → real `managerId` UUID.
  const { data: managersData } = useQuery({
    queryKey: ['employees', { limit: 100 }],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });
  const managers = useMemo(
    () =>
      (managersData?.data ?? []).map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
      })),
    [managersData],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      router.push('/dashboard/employees');
    },
  });

  // Tracks which action triggered the in-flight create so the two buttons can
  // show independent pending states ("Creating..." vs "Saving draft...").
  const [pendingAction, setPendingAction] = useState<'create' | 'draft' | null>(null);

  const submit = useCallback(
    async (options?: { draft?: boolean }) => {
      const draft = options?.draft ?? false;
      const parsed = createEmployeeSchema.safeParse({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        employeeId: values.employeeId,
        hireDate: values.hireDate,
      });
      if (!parsed.success) {
        setErrors(zodFieldErrors(parsed.error));
        return;
      }
      setErrors({});
      setPendingAction(draft ? 'draft' : 'create');

      try {
        await createMutation.mutateAsync({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          employeeId: values.employeeId.trim(),
          hireDate: values.hireDate,
          departmentId: values.departmentId || undefined,
          managerId: values.managerId || undefined,
          jobLevel: values.jobLevel.trim() || undefined,
          salaryGrade: values.salaryGrade.trim() || undefined,
          isDraft: draft,
        });
      } catch {
        /* surfaced via createMutation.isError; inline errors handle validation */
      } finally {
        setPendingAction(null);
      }
    },
    [values, createMutation],
  );

  // "Save & Continue Later" → same create, flagged as a draft.
  const saveDraft = useCallback(() => submit({ draft: true }), [submit]);

  return {
    values,
    setField,
    errors,
    reset,
    submit,
    saveDraft,
    departments,
    managers,
    creating: createMutation.isPending,
    savingDraft: pendingAction === 'draft',
    creatingEmployee: pendingAction === 'create',
  };
}
