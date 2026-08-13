'use client';

import { useState, useCallback } from 'react';
import { payrollService } from '@/lib/services/payroll.service';
import { lookupService } from '@/lib/services/lookup.service';
import { taxService } from '@/lib/services/tax.service';
import type { Lookup } from '@/lib/types/lookup';
import type { TaxType, CreateTaxFilingPayload } from '@/lib/types/payroll';

const newForm = (now: Date): CreateTaxFilingPayload => ({
  taxType: 'paye' as TaxType,
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  totalEmployees: 0,
  grossPayroll: 0,
  taxAmount: 0,
  dueDate: '',
  notes: '',
});

const round2 = (n: number) => Math.round((n || 0) * 100) / 100;
const iso = (d: Date) => d.toISOString().split('T')[0];
/** 21st of the following month — the VAT/WHT remittance deadline. */
const day21NextMonth = (month: number, year: number) => iso(new Date(year, month, 21));

/**
 * New-tax-filing form. The period-driven figures (employees, gross, tax amount,
 * due date) are auto-calculated from the source of truth for that tax:
 *  - VAT / WHT  → the tax-schedule service (invoices, expenses, vouchers)
 *  - payroll taxes (PAYE, pension, NHF, NHIS, NSITF, ITF) → the payroll run
 * so they are never keyed by hand.
 */
export function useTaxFilingForm() {
  const now = new Date();
  const [form, setForm] = useState<CreateTaxFilingPayload>(() => newForm(now));
  const [taxTypeLookups, setTaxTypeLookups] = useState<Lookup[]>([]);
  const [filling, setFilling] = useState(false);

  const autoFill = useCallback(async (taxType: string, month: number, year: number) => {
    setFilling(true);
    // Optimistically reflect the new selection; figures follow once computed.
    setForm((prev) => ({ ...prev, taxType: taxType as TaxType, month, year }));
    try {
      if (taxType === 'vat') {
        const s = await taxService.getVatSchedule(month, year);
        setForm((prev) => ({
          ...prev,
          totalEmployees: s.output.lines.length,
          grossPayroll: round2(s.output.totalTaxable),
          taxAmount: round2(Math.max(0, s.netVatPayable)),
          dueDate: day21NextMonth(month, year),
        }));
        return;
      }
      if (taxType === 'wht') {
        const s = await taxService.getWhtSchedule(month, year);
        setForm((prev) => ({
          ...prev,
          totalEmployees: s.lines.length,
          grossPayroll: round2(s.totalGross),
          taxAmount: round2(s.totalWht),
          dueDate: day21NextMonth(month, year),
        }));
        return;
      }

      // Payroll-derived taxes.
      const dueDateMap: Record<string, string> = {
        paye: iso(new Date(year, month, 10)),
        pension: iso(new Date(year, month + 1, 0)),
        nhf: iso(new Date(year, month + 1, 0)),
        nhis: iso(new Date(year, month + 1, 0)),
        nsitf: iso(new Date(year, month, 16)),
        itf: `${year + 1}-03-31`,
      };
      const dueDate = dueDateMap[taxType] || iso(new Date(year, month, 10));

      const runsData = await payrollService.getRuns({ year, limit: 50 });
      const run = runsData.data.find((r) => r.month === month && r.year === year);
      if (!run || run.status === 'draft') {
        // No finalised run for this period — clear stale figures rather than
        // leaving a previous selection's numbers behind.
        setForm((prev) => ({ ...prev, totalEmployees: 0, grossPayroll: 0, taxAmount: 0, dueDate }));
        return;
      }

      const amountMap: Record<string, number> = {
        paye: Number(run.totalPaye),
        pension: Number(run.totalPension) + Number(run.totalEmployerPension),
        nhf: Number(run.totalNhf),
        nhis: Number(run.totalNhis) + Number(run.totalEmployerNhis),
        nsitf: Number(run.totalNsitf),
        itf: Number(run.totalItf),
      };

      setForm((prev) => ({
        ...prev,
        totalEmployees: run.totalEmployees,
        grossPayroll: round2(Number(run.totalGrossPay)),
        taxAmount: round2(amountMap[taxType] || 0),
        dueDate,
      }));
    } catch {
      // Silently fail — figures stay at their last values.
    } finally {
      setFilling(false);
    }
  }, []);

  /** Reset to a fresh form and load tax-type lookups + auto-fill (on modal open). */
  const start = useCallback(() => {
    const d = new Date();
    setForm(newForm(d));
    lookupService.getByCategory('tax_type').then(setTaxTypeLookups).catch(() => {});
    autoFill('paye', d.getMonth() + 1, d.getFullYear());
  }, [autoFill]);

  return { form, setForm, taxTypeLookups, autoFill, filling, start };
}
