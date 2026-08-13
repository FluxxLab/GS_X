import type { CreateSalaryGradePayload } from "@/lib/types/salary-grade";

/** Default page size for the salary grades list (preserved from the original page). */
export const SALARY_GRADES_PAGE_SIZE = 20;

/** Column headers for the salary grades table (preserved order). */
export const SALARY_GRADE_COLUMNS = [
  "S/N",
  "Grade Level",
  "Label",
  "Min Salary",
  "Max Salary",
  "Steps",
  "Step Increment",
  "Status",
  "Actions",
];

/** Empty/default values for the create salary grade form (preserved). */
export const EMPTY_SALARY_GRADE_FORM: CreateSalaryGradePayload = {
  level: "",
  label: "",
  description: "",
  minimumSalary: 0,
  maximumSalary: 0,
  steps: 10,
  currency: "NGN",
  isActive: true,
  sortOrder: 0,
};

/**
 * Formats a number as Naira with NO fraction digits, e.g. 80000 → "₦ 80,000".
 * Distinct from `fmtCurrency` (2 decimals); preserved byte-for-byte from the
 * original salary-grades page where whole-naira display is required.
 */
export function formatNaira(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return (
    "₦ " +
    num.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}
