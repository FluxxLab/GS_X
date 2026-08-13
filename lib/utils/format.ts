/**
 * Converts SNAKE_CASE or snake_case to Title Case.
 * e.g. "FUEL_ENERGY" → "Fuel Energy", "office_supplies" → "Office Supplies"
 */
export function humanize(str: string | null | undefined): string {
  if (!str) return "—";
  return str
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Formats a number as Nigerian Naira currency, e.g. 1500 → "₦ 1,500.00". */
export function fmtCurrency(n: number): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Thousands-group a raw numeric string for display in an amount input, while
 * preserving exactly what the user is typing — including a trailing "." and any
 * decimals (e.g. "240000" → "240,000", "240000.5" → "240,000.5", "63." → "63.").
 * Pair with `parseAmountInput` to read the value back. Returns "" for empty.
 */
export function formatAmountInput(raw: string): string {
  if (raw === "" || raw == null) return "";
  const [intPart, ...rest] = String(raw).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return rest.length ? `${grouped}.${rest.join("")}` : grouped;
}

/** Strip grouping commas from an amount-input string back to a raw numeric string. */
export function parseAmountInput(display: string): string {
  return display.replace(/,/g, "");
}
