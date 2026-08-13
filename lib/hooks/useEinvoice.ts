"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taxService } from "@/lib/services/tax.service";
import type { Invoice } from "@/lib/types/finance";

/**
 * NRS e-invoice clearance for an invoice. On success the invoice list refreshes
 * so the new clearance status (IRN / cleared / rejected) shows immediately.
 */
export function useEinvoice(opts?: {
  onCleared?: (invoice: Invoice) => void;
  onError?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  const clearMutation = useMutation({
    mutationFn: (invoiceId: string) => taxService.clearEinvoice(invoiceId),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] });
      if (invoice.einvoiceStatus === "rejected") {
        opts?.onError?.(invoice.einvoiceError || "NRS rejected the invoice.");
      } else {
        opts?.onCleared?.(invoice);
      }
    },
    onError: (err: Error) => opts?.onError?.(err.message),
  });

  return {
    clear: clearMutation.mutate,
    clearing: clearMutation.isPending,
    clearingId: clearMutation.isPending ? clearMutation.variables : null,
  };
}
