/** Display maps + formatters for the contract detail document. */

export const TYPE_LABELS: Record<string, string> = {
  permanent: "Permanent", fixed_term: "Fixed Term", probationary: "Probationary", contract: "Contract",
  full_time: "Full-time", part_time: "Part-time", intern: "Internship",
};

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "#ECFDF5", color: "#059669" },
  expired: { bg: "#FEF3C7", color: "#D97706" },
  terminated: { bg: "#FEE2E2", color: "#DC2626" },
  renewed: { bg: "#DBEAFE", color: "#2563EB" },
  pending_renewal: { bg: "#FEF3C7", color: "#D97706" },
};

/** Currency, 2-dp (note: original returns the literal "N0.00" fallback). */
export function fmt(n: number | string | null | undefined): string {
  if (!n) return "N0.00";
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Currency, 0-dp. */
export function fmtShort(n: number | string | null | undefined): string {
  if (!n) return "₦ 0";
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatContractDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
