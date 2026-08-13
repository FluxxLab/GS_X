import type { TourStep } from "./TourProvider";
import { VENDOR_TOUR, VENDOR_TOUR_SEEN_KEY } from "./vendor-tour";

/**
 * Per-page tours for the vendor portal. Each tab highlights its nav item plus
 * the page's own content (marked `data-tour="vendor-content"`). The layout uses
 * `vendorTourForPath` to pick the right tour for the ? button and the once-per-
 * page auto-run.
 */

const PURCHASE_ORDERS_TOUR: TourStep[] = [
  {
    target: '[data-tour="vendor-nav-purchase-orders"]',
    title: "Purchase Orders",
    body: "Every purchase order Maizube awards you is listed on this page.",
  },
  {
    target: '[data-tour="vendor-content"]',
    title: "Open a PO",
    body: "Each row is a purchase order. Click one to see its line items, amounts and status. When empty, this is where new POs will appear.",
  },
];

const CONTRACTS_TOUR: TourStep[] = [
  {
    target: '[data-tour="vendor-nav-contracts"]',
    title: "Contracts",
    body: "Your agreements with Maizube live here.",
  },
  {
    target: '[data-tour="vendor-content"]',
    title: "Contract details",
    body: "Click any contract to see its type, start and end dates, and value.",
  },
];

const INVOICES_TOUR: TourStep[] = [
  {
    target: '[data-tour="vendor-invoice-submit"]',
    title: "Submit an invoice",
    body: "Use this button to bill Maizube against one of your purchase orders. Pick the PO, enter the invoice number, amount and date.",
  },
  {
    target: '[data-tour="vendor-content"]',
    title: "Track payment",
    body: "Invoices you've submitted appear here with their status, so you can see what's been paid.",
  },
];

const RFQS_TOUR: TourStep[] = [
  {
    target: '[data-tour="vendor-nav-rfqs"]',
    title: "Requests for Quotation",
    body: "When Maizube asks vendors to quote, the request shows up here.",
  },
  {
    target: '[data-tour="vendor-content"]',
    title: "Submit a quote",
    body: "Click an RFQ to review what's needed, enter your price per item, and submit your quote for evaluation.",
  },
];

const PROFILE_TOUR: TourStep[] = [
  {
    target: '[data-tour="vendor-nav-profile"]',
    title: "Your profile",
    body: "Your company record with Maizube.",
  },
  {
    target: '[data-tour="vendor-content"]',
    title: "Keep it current",
    body: "Make sure your company and contact details here stay up to date so Maizube can always reach you.",
  },
];

export interface PageTour {
  steps: TourStep[];
  seenKey: string;
}

// Keyed by the last path segment of /vendor/portal/<segment>.
const BY_SEGMENT: Record<string, PageTour> = {
  dashboard: { steps: VENDOR_TOUR, seenKey: VENDOR_TOUR_SEEN_KEY },
  portal: { steps: VENDOR_TOUR, seenKey: VENDOR_TOUR_SEEN_KEY },
  "purchase-orders": { steps: PURCHASE_ORDERS_TOUR, seenKey: "maizube_tour_vendor_po_v1" },
  contracts: { steps: CONTRACTS_TOUR, seenKey: "maizube_tour_vendor_contracts_v1" },
  invoices: { steps: INVOICES_TOUR, seenKey: "maizube_tour_vendor_invoices_v1" },
  rfqs: { steps: RFQS_TOUR, seenKey: "maizube_tour_vendor_rfqs_v1" },
  profile: { steps: PROFILE_TOUR, seenKey: "maizube_tour_vendor_profile_v1" },
};

/** The tour for the current vendor page, or null if the path has none. */
export function vendorTourForPath(pathname: string | null): PageTour | null {
  if (!pathname) return null;
  const seg = pathname.replace(/\/+$/, "").split("/").pop() || "";
  return BY_SEGMENT[seg] ?? null;
}
