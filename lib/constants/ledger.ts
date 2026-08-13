import type { JournalEntry } from "@/lib/types/finance";

export const ITEMS_PER_PAGE = 10;

export const ACCOUNT_TYPES = ["All Accounts", "Assets", "Liabilities", "Revenue", "Expenses", "Equity"];
export const DATE_RANGES = ["This Month", "Last Month", "This Quarter", "This Year", "Custom"];

/** Maps the account-type filter label to the backend `AccountType` enum. */
export const ACCOUNT_TYPE_TO_API: Record<string, string> = {
  Assets: "ASSET",
  Liabilities: "LIABILITY",
  Revenue: "REVENUE",
  Expenses: "EXPENSE",
  Equity: "EQUITY",
};

/** Local-date YYYY-MM-DD (avoids the UTC shift `toISOString()` introduces). */
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Maps a date-range preset to the `startDate`/`endDate` the ledger API accepts.
 * "Custom" (no associated pickers in the filter bar) returns no bounds.
 */
export function dateRangeToParams(preset: string): { startDate?: string; endDate?: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (preset) {
    case "This Month":
      return { startDate: ymd(new Date(y, m, 1)), endDate: ymd(new Date(y, m + 1, 0)) };
    case "Last Month":
      return { startDate: ymd(new Date(y, m - 1, 1)), endDate: ymd(new Date(y, m, 0)) };
    case "This Quarter": {
      const q = Math.floor(m / 3);
      return { startDate: ymd(new Date(y, q * 3, 1)), endDate: ymd(new Date(y, q * 3 + 3, 0)) };
    }
    case "This Year":
      return { startDate: ymd(new Date(y, 0, 1)), endDate: ymd(new Date(y, 11, 31)) };
    default:
      return {};
  }
}

/** Naira amount formatter for the ledger (0 dp, em-dash for empty). */
export function fmtLedgerCurrency(n: number | null | undefined): string {
  if (!n && n !== 0) return "—";
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export interface JLine { accountId: string; debit: string; credit: string; }
export const emptyLine = (): JLine => ({ accountId: "", debit: "", credit: "" });

/** A single journal-entry line flattened for table display. */
export interface FlatLedgerLine {
  id: string;
  date: string;
  reference: string;
  description: string;
  account: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  entryId: string;
  entryStatus: string;
}

/** Flatten journal entries into individual ledger lines for display. */
export function flattenEntries(entries: JournalEntry[]): FlatLedgerLine[] {
  const lines: FlatLedgerLine[] = [];
  for (const entry of entries) {
    if (entry.lines && entry.lines.length > 0) {
      for (const line of entry.lines) {
        lines.push({
          id: line.id,
          date: entry.date,
          reference: entry.entryNumber || entry.reference || "",
          description: line.description || entry.description,
          account: line.account?.name || line.accountId || "",
          debit: line.debit > 0 ? line.debit : null,
          credit: line.credit > 0 ? line.credit : null,
          balance: line.debit - line.credit,
          entryId: entry.id,
          entryStatus: entry.status,
        });
      }
    } else {
      // Entry without lines — show as a single row
      lines.push({
        id: entry.id,
        date: entry.date,
        reference: entry.entryNumber || entry.reference || "",
        description: entry.description,
        account: "",
        debit: entry.totalAmount > 0 ? entry.totalAmount : null,
        credit: null,
        balance: entry.totalAmount,
        entryId: entry.id,
        entryStatus: entry.status,
      });
    }
  }
  return lines;
}
