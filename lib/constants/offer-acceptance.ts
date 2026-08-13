/**
 * Display helpers and labels for the public offer-acceptance page
 * (`app/offer/[token]`). Pure functions only — no React, no `app/` imports.
 */

/** Format a number as Naira with 2 decimals (₦ 1,200,000.00). */
export function formatNaira(amount: number): string {
  return "₦ " + amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format an ISO date as a Nigerian long date (e.g. "3rd June, 2026"). */
export function formatNigerianDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-NG", { month: "long" });
  const year = date.getFullYear();

  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";

  return `${day}${suffix} ${month}, ${year}`;
}

/** Spell out a Naira amount in words ("One Thousand Naira Only"). */
export function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 1000000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + " Million" + (n % 1000000 ? " " + convert(n % 1000000) : "");
    return convert(Math.floor(n / 1000000000)) + " Billion" + (n % 1000000000 ? " " + convert(n % 1000000000) : "");
  }

  return convert(Math.round(num)) + " Naira Only";
}

/** Human-readable label for a job-posting employment type. */
export function employmentTypeLabel(type?: string): string {
  switch (type) {
    case "full_time": return "Full-Time";
    case "part_time": return "Part-Time";
    case "contract": return "Contract";
    case "intern": return "Internship";
    default: return "Full-Time";
  }
}

/** Subject options for the "Request Changes" modal. */
export const CHANGE_SUBJECT_OPTIONS: { value: string; label: string }[] = [
  { value: "compensation", label: "Compensation / Salary" },
  { value: "benefits", label: "Benefits Package" },
  { value: "start_date", label: "Start Date" },
  { value: "location", label: "Work Location" },
  { value: "role", label: "Job Title / Role" },
  { value: "other", label: "Other" },
];
