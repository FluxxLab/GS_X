export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const TYPE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  paye:    { bg: "rgba(0, 195, 237,0.1)", color: "#081340", label: "PAYE" },
  pension: { bg: "#F3E8FF",              color: "#9333EA", label: "Pension" },
  nhf:     { bg: "#DBEAFE",              color: "#2563EB", label: "NHF" },
  nhis:    { bg: "#ECFDF5",              color: "#059669", label: "NHIS" },
  nsitf:   { bg: "#FEF3C7",              color: "#D97706", label: "NSITF" },
  itf:     { bg: "#FEE2E2",              color: "#DC2626", label: "ITF" },
  vat:     { bg: "#E0F2FE",              color: "#0369A1", label: "VAT" },
  wht:     { bg: "#FEF9C3",              color: "#A16207", label: "WHT" },
};

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft:    { bg: "#F4F6FB", color: "#70768E" },
  pending:  { bg: "#FEF3C7", color: "#92400E" },
  filed:    { bg: "#DBEAFE", color: "#1D4ED8" },
  remitted: { bg: "#D1FAE5", color: "#065F46" },
  overdue:  { bg: "#FEE2E2", color: "#991B1B" },
};

export const TYPE_FULL_LABELS: Record<string, string> = {
  paye: "PAYE Tax", pension: "Pension Contribution", nhf: "National Housing Fund",
  nhis: "National Health Insurance", nsitf: "NSITF Contribution", itf: "Industrial Training Fund",
  vat: "Value Added Tax", wht: "Withholding Tax",
};

/**
 * Filing-type grouping. Only PAYE/VAT/WHT are true taxes (filed with the NRS or
 * State IRS); pension/NHF/NHIS/NSITF/ITF are statutory contributions/levies
 * remitted to other agencies. Keys not listed here default to "Other".
 */
export const FILING_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Taxes", keys: ["paye", "vat", "wht"] },
  { label: "Statutory Contributions", keys: ["pension", "nhf", "nhis", "nsitf", "itf"] },
];

/** The group a filing type belongs to ("Taxes" | "Statutory Contributions" | "Other"). */
export function filingGroupOf(key: string): string {
  return FILING_GROUPS.find((g) => g.keys.includes(key))?.label ?? "Other";
}

export function fmtTaxAmount(n: number | string | null): string {
  if (n === null || n === undefined) return "₦ 0";
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatTaxDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
