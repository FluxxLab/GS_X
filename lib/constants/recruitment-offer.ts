import type { CSSProperties } from "react";

/**
 * Display maps + shared inline-style tokens for the offers page.
 * Neutral constants module — never imports from `app/`.
 */

const font = "var(--font-inter), Inter, sans-serif";

export const OFFER_STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#FEF3C7", color: "#B45309" },
  sent: { bg: "#DBEAFE", color: "#1D4ED8" },
  accepted: { bg: "#D1FAE5", color: "#047857" },
  rejected: { bg: "#FFE4E6", color: "#BE123C" },
  expired: { bg: "#F4F6FB", color: "#70768E" },
  revised: { bg: "#EDE9FE", color: "#7C3AED" },
  withdrawn: { bg: "#F4F6FB", color: "#70768E" },
};

export const offerInputStyle: CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1px solid #DAE0EF", borderRadius: 8,
  fontFamily: font, fontSize: 14, color: "#081340", outline: "none", background: "#FFF",
  boxSizing: "border-box",
};

export const offerLabelStyle: CSSProperties = {
  fontFamily: font, fontWeight: 600, fontSize: 13, color: "#081340", display: "block", marginBottom: 6,
};
