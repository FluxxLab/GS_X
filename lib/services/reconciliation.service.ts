import { apiClient } from "../api/client";
import type {
  ReconciliationReport,
  SalesVarianceReport,
} from "../types/reconciliation";

const PATH = "/finance/reconciliation";

export const reconciliationService = {
  /** Current GL ↔ sub-ledger reconciliation report (read-only). */
  get(): Promise<ReconciliationReport> {
    return apiClient.get<ReconciliationReport>(PATH);
  },

  /** Re-run the health check now; notifies finance on any drift. */
  run(): Promise<ReconciliationReport> {
    return apiClient.post<ReconciliationReport>(`${PATH}/run`);
  },

  /**
   * Unaccounted sales collections by supervisor. The reconciliation says
   * whether the books agree; this says who to ask.
   */
  salesVariance(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<SalesVarianceReport> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    const qs = query.toString();
    return apiClient.get<SalesVarianceReport>(
      `${PATH}/sales-variance${qs ? `?${qs}` : ""}`,
    );
  },
};
