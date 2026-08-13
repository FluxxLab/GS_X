"use client";

import { useQuery } from "@tanstack/react-query";
import { financeService } from "@/lib/services/finance.service";
import { manufacturingService } from "@/lib/services/manufacturing.service";
import {
  getDateRange, getComparisonDateRange, getTrailing12Range, type CompareBasis,
} from "@/lib/constants/finance-dashboard";

/**
 * Company-wide comparative snapshot for the MD dashboard. Fetches the finance
 * overview for the selected period and its comparison baseline (prior period or
 * same-period-last-year) for deltas, a trailing-12-month series for sparklines,
 * and the inventory valuation. Sources are independent — one slow/failed query
 * never blocks the rest.
 */
export function useExecutiveDashboard(period: string, basis: CompareBasis) {
  const current = useQuery({
    queryKey: ["exec", "finance", period, "current"],
    queryFn: () => financeService.getDashboard(getDateRange(period)),
  });
  const previous = useQuery({
    queryKey: ["exec", "finance", period, basis, "baseline"],
    queryFn: () => financeService.getDashboard(getComparisonDateRange(period, basis)),
  });
  const trend = useQuery({
    queryKey: ["exec", "finance", "trend12"],
    queryFn: () => financeService.getDashboard(getTrailing12Range()),
  });
  const inventory = useQuery({
    queryKey: ["exec", "inventory"],
    queryFn: () => manufacturingService.getInventoryValuation(),
  });

  return {
    finance: current.data,
    previous: previous.data,
    trend: trend.data?.revenueVsExpenses ?? [],
    inventory: inventory.data,
    loading: current.isLoading || inventory.isLoading,
  };
}
