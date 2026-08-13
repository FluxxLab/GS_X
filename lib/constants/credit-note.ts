import type { CreditNoteStatus } from "@/lib/types/finance";

export type CreditNoteDisplayStatus = "Draft" | "Issued" | "Cancelled";

export const CN_ITEMS_PER_PAGE = 20;

export function getCreditNoteDisplayStatus(
  status: CreditNoteStatus,
): CreditNoteDisplayStatus {
  const map: Record<CreditNoteStatus, CreditNoteDisplayStatus> = {
    DRAFT: "Draft",
    ISSUED: "Issued",
    CANCELLED: "Cancelled",
  };
  return map[status] || "Draft";
}

export const CN_STATUS_BADGE: Record<
  CreditNoteDisplayStatus,
  { bg: string; dot: string; color: string }
> = {
  Draft: { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
  Issued: { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  Cancelled: { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
};

export const CN_STATUSES: {
  value: string;
  label: string;
  apiValue?: CreditNoteStatus;
}[] = [
  { value: "All", label: "All Status" },
  { value: "Draft", label: "Draft", apiValue: "DRAFT" },
  { value: "Issued", label: "Issued", apiValue: "ISSUED" },
  { value: "Cancelled", label: "Cancelled", apiValue: "CANCELLED" },
];

/** 0-dp Naira formatter, matching the invoices page. */
export function fmtCreditNoteCurrency(n: number | string): string {
  return (
    "₦ " +
    Number(n).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

export function formatCreditNoteDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
