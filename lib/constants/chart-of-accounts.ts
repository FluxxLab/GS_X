import type { AccountType as ApiAccountType } from "@/lib/types/finance";

export type DisplayAccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
export type AccountStatus = "Active" | "Inactive";

export const ITEMS_PER_PAGE = 10;

export const TYPE_BADGE: Record<DisplayAccountType, { bg: string; color: string }> = {
  Asset:     { bg: "#EFF6FF", color: "#1D4ED8" },
  Liability: { bg: "#F4F6FB", color: "#081340" },
  Equity:    { bg: "#F4F6FB", color: "#081340" },
  Revenue:   { bg: "#ECFDF5", color: "#047857" },
  Expense:   { bg: "#FFF1F2", color: "#BE123C" },
};

export const STATUS_DOT: Record<AccountStatus, string> = {
  Active: "#10B981",
  Inactive: "#DAE0EF",
};

export const STATUS_TEXT: Record<AccountStatus, string> = {
  Active: "#081340",
  Inactive: "#70768E",
};

export const TABS = ["All Accounts", "Assets", "Liabilities", "Equity", "Revenue", "Expenses"];

export function apiTypeToDisplay(type: ApiAccountType): DisplayAccountType {
  const map: Record<ApiAccountType, DisplayAccountType> = {
    ASSET: "Asset",
    LIABILITY: "Liability",
    EQUITY: "Equity",
    REVENUE: "Revenue",
    EXPENSE: "Expense",
  };
  return map[type] || "Asset";
}

export function tabToApiType(tab: string): ApiAccountType | undefined {
  const map: Record<string, ApiAccountType> = {
    Assets: "ASSET",
    Liabilities: "LIABILITY",
    Equity: "EQUITY",
    Revenue: "REVENUE",
    Expenses: "EXPENSE",
  };
  return map[tab];
}
