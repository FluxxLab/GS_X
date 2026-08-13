"use client";

import { useQuery } from "@tanstack/react-query";
import { executiveService } from "@/lib/services/executive.service";

/** Production + sales + operations rollups for the MD dashboard. */
export function useOperationalSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["executive", "summary"],
    queryFn: () => executiveService.getSummary(),
  });
  return { summary: data, loading: isLoading };
}
