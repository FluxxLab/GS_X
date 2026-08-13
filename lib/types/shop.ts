export type ShopOrderStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "fulfilled"
  | "cancelled";

export const SHOP_ORDER_STATUS_LABEL: Record<ShopOrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  confirmed: "Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export interface ShopOrderLine {
  id: string;
  productId: string;
  sku: string | null;
  productName: string;
  unitPrice: string;
  quantity: number;
  amount: string;
}

export interface ShopOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryArea: string | null;
  notes: string | null;
  status: ShopOrderStatus;
  subtotal: string;
  total: string;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

export interface ShopOrder extends ShopOrderSummary {
  lines: ShopOrderLine[];
}

export interface QueryOrdersParams {
  status?: ShopOrderStatus;
  search?: string;
}
