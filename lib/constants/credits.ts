import type { PaymentMethod } from "@/lib/types/finance";

export const REFUNDS_PER_PAGE = 20;

/** Refund payout methods (mirrors the payment methods enum). */
export const REFUND_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "POS", label: "POS" },
  { value: "ONLINE", label: "Online" },
];
