import { apiClient } from "../api/client";
import type { ExecutiveSummary } from "@/lib/types/executive";

/** Cross-module executive rollups (production, sales, operations) for the MD dashboard. */
export const executiveService = {
  getSummary(year?: number): Promise<ExecutiveSummary> {
    return apiClient.get<ExecutiveSummary>(
      "/executive/summary",
      year ? { year } : undefined,
    );
  },
};
