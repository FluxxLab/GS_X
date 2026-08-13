"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopService } from "../services/shop.service";
import type { ShopOrderSummary, QueryOrdersParams } from "../types/shop";

/**
 * Storefront order desk. Gated on sales.orders.* server-side.
 *
 * No `onError` on the mutation: that would silence the global toast and hide a
 * failed status change from the operator.
 */
export function useShopOrders(params: QueryOrdersParams = {}) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["shop", "orders"] });

  const { data, isLoading } = useQuery({
    queryKey: ["shop", "orders", params],
    queryFn: () => shopService.listOrders(params),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "fulfilled" | "cancelled" }) =>
      shopService.updateStatus(id, status),
    onSuccess: invalidate,
  });

  return {
    orders: (data ?? []) as ShopOrderSummary[],
    loading: isLoading,
    updateStatus,
  };
}
