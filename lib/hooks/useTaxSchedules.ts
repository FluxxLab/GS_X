"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taxService } from "@/lib/services/tax.service";
import type { TaxScheduleType } from "@/lib/types/tax";

/**
 * Owns the tax-return schedules screen: active tax type, period (month/year),
 * and the three period-scoped queries. Only the active tab's query runs.
 */
export function useTaxSchedules() {
  const [tab, setTab] = useState<TaxScheduleType>("vat");
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });
  const { month, year } = period;

  const vat = useQuery({
    queryKey: ["tax-schedule", "vat", month, year],
    queryFn: () => taxService.getVatSchedule(month, year),
    enabled: tab === "vat",
  });
  const wht = useQuery({
    queryKey: ["tax-schedule", "wht", month, year],
    queryFn: () => taxService.getWhtSchedule(month, year),
    enabled: tab === "wht",
  });
  const paye = useQuery({
    queryKey: ["tax-schedule", "paye", month, year],
    queryFn: () => taxService.getPayeSchedule(month, year),
    enabled: tab === "paye",
  });

  const active = tab === "vat" ? vat : tab === "wht" ? wht : paye;

  return {
    tab,
    setTab,
    month,
    year,
    setMonth: (m: number) => setPeriod((p) => ({ ...p, month: m })),
    setYear: (y: number) => setPeriod((p) => ({ ...p, year: y })),
    vat,
    wht,
    paye,
    loading: active.isLoading,
    error: active.isError,
  };
}
