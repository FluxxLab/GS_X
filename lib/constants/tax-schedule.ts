import type {
  TaxScheduleType,
  VatSchedule,
  WhtSchedule,
  PayeSchedule,
} from "@/lib/types/tax";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const TAX_TABS: { key: TaxScheduleType; label: string; full: string }[] = [
  { key: "vat", label: "VAT", full: "Value Added Tax" },
  { key: "wht", label: "WHT", full: "Withholding Tax" },
  { key: "paye", label: "PAYE", full: "Pay As You Earn" },
];

/** Naira, thousands-separated, 2dp. */
export function fmtNaira(n: number): string {
  return `₦ ${(n ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** A plain number for spreadsheets (no currency symbol). */
function money(n: number): number {
  return Math.round((n ?? 0) * 100) / 100;
}

type Cell = string | number | null | undefined;
export interface ExportPayload {
  baseName: string;
  title: string;
  headers: string[];
  rows: Cell[][];
}

/** Flatten a VAT schedule into a single export (Output rows, then Input rows). */
export function vatExport(s: VatSchedule): ExportPayload {
  const headers = [
    "Section", "Reference", "Date", "Party", "TIN",
    "Taxable Value", "Rate (%)", "VAT",
  ];
  const rows: Cell[][] = [
    ...s.output.lines.map((l) => [
      "Output", l.reference, l.date, l.party, l.tin ?? "",
      money(l.taxableValue), l.rate, money(l.vat),
    ]),
    ...s.input.lines.map((l) => [
      "Input", l.reference, l.date, l.party, l.tin ?? "",
      money(l.taxableValue), l.rate, money(l.vat),
    ]),
  ];
  return {
    baseName: `VAT-return-${s.period.year}-${String(s.period.month).padStart(2, "0")}`,
    title: `VAT Return · ${s.period.label} (TIN ${s.companyTin || "—"})`,
    headers,
    rows,
  };
}

export function whtExport(s: WhtSchedule): ExportPayload {
  return {
    baseName: `WHT-schedule-${s.period.year}-${String(s.period.month).padStart(2, "0")}`,
    title: `WHT Schedule · ${s.period.label} (TIN ${s.companyTin || "—"})`,
    headers: [
      "Reference", "Date", "Beneficiary", "TIN", "Nature",
      "Gross Amount", "Rate (%)", "WHT Withheld",
    ],
    rows: s.lines.map((l) => [
      l.reference, l.date, l.beneficiary, l.tin ?? "", l.nature,
      money(l.grossAmount), l.rate, money(l.whtAmount),
    ]),
  };
}

export function payeExport(s: PayeSchedule): ExportPayload {
  return {
    baseName: `PAYE-schedule-${s.period.year}-${String(s.period.month).padStart(2, "0")}`,
    title: `PAYE Schedule · ${s.period.label} (TIN ${s.companyTin || "—"})`,
    headers: [
      "Employee", "TIN", "Gross Emolument",
      "Annual Taxable Income", "Monthly PAYE",
    ],
    rows: s.lines.map((l) => [
      l.employeeName, l.tin ?? "",
      money(l.grossEmolument), money(l.annualTaxableIncome), money(l.monthlyPaye),
    ]),
  };
}
