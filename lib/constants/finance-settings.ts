export interface FinanceSettingsCategory {
  key: string;
  label: string;
  singular: string;
  valuePlaceholder: string;
  labelPlaceholder: string;
  descPlaceholder: string;
}

export const CATEGORIES: FinanceSettingsCategory[] = [
  { key: "budget_category", label: "Budget Categories", singular: "Budget Category", valuePlaceholder: "e.g. water_treatment", labelPlaceholder: "e.g. Water Treatment & Distribution", descPlaceholder: "Department this category belongs to" },
  { key: "budget_period", label: "Budget Periods", singular: "Budget Period", valuePlaceholder: "e.g. q1_2026", labelPlaceholder: "e.g. Q1 2026", descPlaceholder: "" },
  { key: "budget_approver", label: "Budget Approvers", singular: "Budget Approver", valuePlaceholder: "e.g. adamu_bello", labelPlaceholder: "e.g. Adamu Bello · MD", descPlaceholder: "Role or title" },
  { key: "account_type", label: "Account Types", singular: "Account Type", valuePlaceholder: "e.g. ASSET", labelPlaceholder: "e.g. Asset", descPlaceholder: "Chart of accounts category" },
];
