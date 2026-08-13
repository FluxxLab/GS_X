export type ReconciliationCheckStatus = "ok" | "drift" | "monitor";

export interface ReconciliationCheck {
  key: string;
  label: string;
  accountCode: string;
  glBalance: number;
  subLedgerBalance: number | null;
  difference: number;
  status: ReconciliationCheckStatus;
  note?: string;
}

export interface ReconciliationReport {
  generatedAt: string;
  balanced: boolean;
  trialBalance: { debitTotal: number; creditTotal: number; difference: number };
  checks: ReconciliationCheck[];
  driftCount: number;
}

/**
 * Water that left the yard against the money declared for it, per supervisor.
 * Revenue is recognised at the value of the goods relieved, so anything not
 * handed in sits in Sales Collection Variance until it is recovered or
 * written off. A shortfall here is money owed by whoever took the stock out.
 */
export interface SalesVarianceRow {
  supervisor: string;
  reports: number;
  goodsValue: number;
  declared: number;
  shortfall: number;
}

export interface SalesVarianceReport {
  supervisors: SalesVarianceRow[];
  totalShortfall: number;
}
