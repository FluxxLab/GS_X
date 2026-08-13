'use client';

import { useQuery } from '@tanstack/react-query';
import { payrollService } from '../services/payroll.service';

/** The three payroll reports for a run: register, statutory summary, bank schedule. */
export function usePayrollReports(runId: string | null) {
  const enabled = !!runId;
  const register = useQuery({
    queryKey: ['payroll', 'register', runId],
    queryFn: () => payrollService.getPayrollRegister(runId as string),
    enabled,
  });
  const statutory = useQuery({
    queryKey: ['payroll', 'statutory', runId],
    queryFn: () => payrollService.getStatutorySummary(runId as string),
    enabled,
  });
  const bank = useQuery({
    queryKey: ['payroll', 'bank-schedule', runId],
    queryFn: () => payrollService.getBankSchedule(runId as string),
    enabled,
  });

  return {
    register: register.data ?? null,
    statutory: statutory.data ?? null,
    bankSchedule: bank.data ?? null,
    loading: register.isLoading || statutory.isLoading || bank.isLoading,
  };
}

export function usePayrollRuns() {
  const { data, isLoading } = useQuery({
    queryKey: ['payroll', 'runs', 'all'],
    queryFn: () => payrollService.getRuns({ limit: 100 }),
  });
  return { runs: data?.data ?? [], loading: isLoading };
}
