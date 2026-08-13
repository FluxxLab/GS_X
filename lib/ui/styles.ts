import type { CSSProperties } from "react";

/**
 * Shared style tokens. Until the pages migrate to Tailwind/shadcn, these
 * de-duplicate the most-repeated inline styles (forms, buttons) so feature
 * components don't each re-declare them.
 */
export const FONT = "var(--font-inter), Inter, sans-serif";
export const PRIMARY = "#081340";

export const inputStyle: CSSProperties = {
  width: "100%", padding: "8px 12px", border: "1px solid #DAE0EF", borderRadius: 8,
  fontSize: 13, fontFamily: FONT, outline: "none",
};

export const labelStyle: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#70768E", marginBottom: 4, display: "block",
};

export const fieldErrorStyle: CSSProperties = {
  display: "block", color: "#DC2626", fontSize: 12, marginTop: 4, fontFamily: FONT,
};

export const btnPrimary: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "0 20px", height: 40,
  background: PRIMARY, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
  color: "#FFFFFF", cursor: "pointer", fontFamily: FONT,
  boxShadow: "0px 10px 15px -3px rgba(8, 19, 64,0.2), 0px 4px 6px -4px rgba(8, 19, 64,0.2)",
};

export const btnOutline: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "0 16px", height: 40,
  background: "#FFFFFF", border: "1px solid #DAE0EF", borderRadius: 10, fontSize: 13, fontWeight: 600,
  color: "#081340", cursor: "pointer", fontFamily: FONT,
};
