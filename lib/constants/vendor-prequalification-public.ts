import type { CSSProperties } from "react";

/**
 * Page-specific style tokens / static content for the public vendor
 * prequalification form (`app/vendor/prequalification`). Kept byte-for-byte
 * identical to the original inline styles. No React, no `app/` imports.
 */
// Aligned to the marketing site: Inter, navy #081340, #F4F6FB fields with a
// #DAE0EF border. Every step component reads these, so recolouring here restyles
// the whole form. Fonts are loaded by app/vendor/prequalification/layout.tsx.
export const VPQ_FONT = "var(--font-inter), Inter, sans-serif";
export const VPQ_PRIMARY = "#081340";

export const vpqInputStyle: CSSProperties = {
  width: "100%", height: 52, padding: "0 20px", fontSize: 15, borderRadius: 8,
  border: "1px solid #DAE0EF", outline: "none", color: "#081340", backgroundColor: "#F4F6FB",
  boxSizing: "border-box", fontFamily: VPQ_FONT, transition: "border-color 0.15s",
};

export const vpqLabelStyle: CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#081340", marginBottom: 8, fontFamily: VPQ_FONT,
};

export const VPQ_STEPS = [
  { title: "Company Information", subtitle: "Basic details about your company" },
  { title: "Registration & Compliance", subtitle: "Business registration and services" },
  { title: "Banking & Financial Info", subtitle: "Payment and financial details" },
] as const;

export const VPQ_INFO_CARDS = [
  { title: "Review Process", desc: "Applications are reviewed within 5-7 business days by our procurement team." },
  { title: "Required Documents", desc: "CAC certificate, tax clearance, and bank details help speed up the review." },
  { title: "After Approval", desc: "Approved vendors can participate in procurement opportunities and purchase orders." },
] as const;
