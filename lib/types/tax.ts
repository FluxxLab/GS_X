export type TaxScheduleType = "vat" | "wht" | "paye";

export interface PeriodInfo {
  month: number;
  year: number;
  label: string;
}

export interface VatLine {
  reference: string;
  date: string;
  party: string;
  tin: string | null;
  taxableValue: number;
  rate: number;
  vat: number;
}

export interface VatSection {
  lines: VatLine[];
  totalTaxable: number;
  totalVat: number;
}

export interface VatSchedule {
  taxType: "VAT";
  period: PeriodInfo;
  companyTin: string;
  output: VatSection;
  input: VatSection;
  netVatPayable: number;
}

export interface WhtLine {
  reference: string;
  date: string;
  beneficiary: string;
  tin: string | null;
  nature: string;
  grossAmount: number;
  rate: number;
  whtAmount: number;
}

export interface WhtSchedule {
  taxType: "WHT";
  period: PeriodInfo;
  companyTin: string;
  lines: WhtLine[];
  totalGross: number;
  totalWht: number;
}

export interface PayeLine {
  employeeName: string;
  tin: string | null;
  grossEmolument: number;
  annualTaxableIncome: number;
  monthlyPaye: number;
}

export interface PayeSchedule {
  taxType: "PAYE";
  period: PeriodInfo;
  companyTin: string;
  lines: PayeLine[];
  totalGross: number;
  totalPaye: number;
}
