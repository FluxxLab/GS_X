import { ArrowDownLeft, ArrowUpRight, Banknote, CreditCard, Building2, Receipt } from "lucide-react";
import type { PaymentType, PaymentMethod, PaymentStatus } from "@/lib/types/finance";

export const TABS = ["All Payments", "Incoming", "Outgoing"];
export const STATUS_FILTERS = ["All", "COMPLETED", "PENDING", "FAILED", "REVERSED"];
export const ITEMS_PER_PAGE = 20;

export const STATUS_DISPLAY: Record<PaymentStatus, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  FAILED: "Failed",
  REVERSED: "Reversed",
};

export const STATUS_BADGE: Record<PaymentStatus, { bg: string; dot: string; color: string }> = {
  COMPLETED: { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  PENDING:   { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  FAILED:    { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
  REVERSED:  { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
};

export const TYPE_ICON: Record<PaymentType, { icon: typeof ArrowDownLeft; color: string; bg: string; label: string }> = {
  INCOMING: { icon: ArrowDownLeft, color: "#059669", bg: "rgba(5,150,105,0.08)", label: "Incoming" },
  OUTGOING: { icon: ArrowUpRight, color: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "Outgoing" },
};

export const METHOD_DISPLAY: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
  CHEQUE: "Cheque",
  POS: "POS",
  ONLINE: "Online",
};

export const METHOD_ICON: Record<PaymentMethod, typeof Banknote> = {
  BANK_TRANSFER: Building2,
  CASH: Banknote,
  CHEQUE: Receipt,
  POS: CreditCard,
  ONLINE: CreditCard,
};

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

/** "₦ 1,500" — whole-naira, no decimals (the payments-page style). */
export function fmtPaymentCurrency(n: number | string): string {
  return "₦ " + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatPaymentDate(d: string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
