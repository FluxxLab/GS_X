import { apiClient } from "../api/client";
import type {
  VatSchedule,
  WhtSchedule,
  PayeSchedule,
} from "@/lib/types/tax";
import type { Invoice } from "@/lib/types/finance";

const PATH = "/tax/schedules";
const EINVOICE = "/tax/einvoice";

/** Monthly NRS return schedules (VAT / WHT / PAYE) computed from ERP data. */
export const taxService = {
  getVatSchedule(month: number, year: number): Promise<VatSchedule> {
    return apiClient.get<VatSchedule>(`${PATH}/vat`, { month, year });
  },
  getWhtSchedule(month: number, year: number): Promise<WhtSchedule> {
    return apiClient.get<WhtSchedule>(`${PATH}/wht`, { month, year });
  },
  getPayeSchedule(month: number, year: number): Promise<PayeSchedule> {
    return apiClient.get<PayeSchedule>(`${PATH}/paye`, { month, year });
  },

  /** Active e-invoice provider + whether it can transmit. */
  getEinvoiceStatus(): Promise<{ provider: string; configured: boolean }> {
    return apiClient.get<{ provider: string; configured: boolean }>(
      `${EINVOICE}/status`,
    );
  },
  /** Submit an invoice to the NRS MBS for clearance. */
  clearEinvoice(invoiceId: string): Promise<Invoice> {
    return apiClient.post<Invoice>(`${EINVOICE}/${invoiceId}/clear`, {});
  },
};
