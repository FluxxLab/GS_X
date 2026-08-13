import type { TourStep } from "./TourProvider";

/**
 * Intro tour for the vendor portal: the top navigation and the account
 * dashboard. Targets are `data-tour="vendor-…"` markers on the real elements.
 */
export const VENDOR_TOUR: TourStep[] = [
  {
    target: '[data-tour="vendor-nav-dashboard"]',
    title: "Welcome to the Vendor Portal",
    body: "This quick tour shows you around your account with Maizube. You can replay it anytime from the ? button.",
  },
  {
    target: '[data-tour="vendor-nav-purchase-orders"]',
    title: "Purchase Orders",
    body: "Every purchase order Maizube awards you appears here. Open one to see its line items and amounts.",
  },
  {
    target: '[data-tour="vendor-nav-contracts"]',
    title: "Contracts",
    body: "Your active and past contracts, with their start and end dates and values.",
  },
  {
    target: '[data-tour="vendor-nav-invoices"]',
    title: "Invoices",
    body: "Submit invoices against your purchase orders and track whether they've been paid.",
  },
  {
    target: '[data-tour="vendor-nav-rfqs"]',
    title: "RFQs",
    body: "Respond to requests for quotation: enter your pricing per item and submit a quote.",
  },
  {
    target: '[data-tour="vendor-nav-profile"]',
    title: "Your profile",
    body: "Keep your company and contact details up to date here.",
  },
  {
    target: '[data-tour="vendor-account"]',
    title: "Your account",
    body: "Open this menu in the top-right to sign out.",
  },
  {
    target: '[data-tour="vendor-overview"]',
    title: "Your dashboard",
    body: "A snapshot of your purchase orders, contracts and payments. That's it, you're all set.",
  },
];

/** Per-user localStorage key so the vendor tour auto-runs only once. */
export const VENDOR_TOUR_SEEN_KEY = "maizube_tour_vendor_v1";
