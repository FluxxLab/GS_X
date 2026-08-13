import type { CSSProperties } from "react";

/**
 * Page-specific style tokens for the public careers apply form
 * (`app/careers/[id]/apply`). These intentionally differ from
 * `lib/ui/styles.ts` (taller inputs, larger font) to match the original page
 * byte-for-byte. No React, no `app/` imports.
 */
export const APPLY_FONT = "var(--font-inter), Inter, sans-serif";

export const applyInputStyle: CSSProperties = {
  width: "100%", height: 48, padding: "0 16px", fontSize: 15, borderRadius: 10,
  border: "1px solid #DAE0EF", outline: "none", color: "#081340", backgroundColor: "#FFFFFF",
  boxSizing: "border-box", fontFamily: APPLY_FONT, transition: "border-color 0.15s",
};

export const applyLabelStyle: CSSProperties = {
  display: "block", fontSize: 14, fontWeight: 600, color: "#081340", marginBottom: 8, fontFamily: APPLY_FONT,
};

export const applyFieldErrorStyle: CSSProperties = {
  display: "block", color: "#DC2626", fontSize: 12.5, marginTop: 5, fontFamily: APPLY_FONT,
};
