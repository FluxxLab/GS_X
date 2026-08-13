import type { CSSProperties } from "react";

/**
 * Page-specific style tokens for the public login / landing page (`app/page.tsx`).
 * Kept byte-for-byte identical to the original inline styles. No React, no
 * `app/` imports.
 */
export const LANDING_FONT = "var(--font-inter), Inter, sans-serif";

export const LANDING_PRIMARY = "#081340";

/** Number of OTP digit inputs. */
export const OTP_LENGTH = 6;

/** Resend-code cooldown in seconds. */
export const OTP_RESEND_SECONDS = 60;

export const loginLabelStyle: CSSProperties = {
  fontFamily: LANDING_FONT,
  fontWeight: 600,
  fontSize: 13,
  lineHeight: "20px",
  color: "#081340",
};

export const loginInputStyle: CSSProperties = {
  height: 52,
  paddingLeft: 44,
  paddingRight: 16,
  background: "#F4F6FB",
  border: "1px solid #DAE0EF",
  borderRadius: 8,
  fontFamily: LANDING_FONT,
  fontWeight: 400,
  fontSize: 15,
  color: "#081340",
};

export const loginErrorStyle: CSSProperties = {
  padding: "12px 16px",
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: 8,
  fontFamily: LANDING_FONT,
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
  color: "#DC2626",
};
