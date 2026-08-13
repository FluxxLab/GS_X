import { apiClient } from "../api/client";
import type {
  ShopOrder,
  ShopOrderSummary,
  QueryOrdersParams,
} from "../types/shop";

const PATH = "/shop/admin";

export const shopService = {
  listOrders(params?: QueryOrdersParams): Promise<ShopOrderSummary[]> {
    return apiClient.get<ShopOrderSummary[]>(
      `${PATH}/orders`,
      params as Record<string, string | undefined>,
    );
  },

  getOrder(id: string): Promise<ShopOrder> {
    return apiClient.get<ShopOrder>(`${PATH}/orders/${id}`);
  },

  pendingCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>(`${PATH}/orders/pending-count`);
  },

  /** confirm / fulfil / cancel. Payment states are not settable by hand. */
  updateStatus(
    id: string,
    status: "confirmed" | "fulfilled" | "cancelled",
  ): Promise<ShopOrder> {
    return apiClient.patch<ShopOrder>(`${PATH}/orders/${id}/status`, { status });
  },

  /** Product catalog image (gated on manufacturing.inventory.create). */
  uploadProductImage(productId: string, file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload(`${PATH}/products/${productId}/image`, formData);
  },
};
