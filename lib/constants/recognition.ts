import type { RecognitionType, RecognitionStatus } from "@/lib/types/recognition";

export const RECOGNITION_TYPE_LABEL: Record<RecognitionType, string> = {
  employee_of_the_month: "Employee of the Month",
  employee_of_the_quarter: "Employee of the Quarter",
  employee_of_the_year: "Employee of the Year",
  certificate: "Certificate of Recognition",
  bonus: "Performance Bonus",
  commendation: "Commendation",
};

export const RECOGNITION_TYPES = Object.keys(RECOGNITION_TYPE_LABEL) as RecognitionType[];

/** Only these carry a period, and only one person can hold each per period. */
export const TITLED_TYPES: RecognitionType[] = [
  "employee_of_the_month",
  "employee_of_the_quarter",
  "employee_of_the_year",
];

/** The period format each titled award expects — mirrored from the API. */
export const PERIOD_HINT: Partial<Record<RecognitionType, string>> = {
  employee_of_the_month: "YYYY-MM (e.g. 2026-07)",
  employee_of_the_quarter: "YYYY-Qn (e.g. 2026-Q3)",
  employee_of_the_year: "YYYY (e.g. 2026)",
};

export const RECOGNITION_STATUS_STYLES: Record<RecognitionStatus, string> = {
  nominated: "bg-[#FEF3C7] text-[#92400E]",
  approved: "bg-[#DCFCE7] text-[#166534]",
  rejected: "bg-[#FEE2E2] text-[#991B1B]",
};

/** A distinct accent per titled award, so the wall reads at a glance. */
export const RECOGNITION_TYPE_STYLES: Record<RecognitionType, string> = {
  employee_of_the_year: "bg-[#FEF3C7] text-[#92400E]",
  employee_of_the_quarter: "bg-[#EFF4FA] text-[#081340]",
  employee_of_the_month: "bg-[#EFF4FA] text-[#081340]",
  certificate: "bg-[#DCFCE7] text-[#166534]",
  bonus: "bg-[#DBEAFE] text-[#1E40AF]",
  commendation: "bg-[#F4F6FB] text-[#70768E]",
};
