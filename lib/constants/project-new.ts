import type { CSSProperties } from "react";

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** Shared field label (identical across all sections). */
export const pnLabel: CSSProperties = { fontSize: "14px", fontWeight: 700, lineHeight: "20px", color: "#081340" };

/** Shared <select> styling (the two selects are byte-identical). */
export const pnSelect: CSSProperties = {
  width: "100%", height: "50px", padding: "0 40px 0 13px", backgroundColor: "#FFFFFF",
  border: "1px solid #DAE0EF", borderRadius: "8px", fontFamily: "inherit", fontSize: "16px",
  lineHeight: "24px", color: "#081340", appearance: "none", cursor: "pointer", outline: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
};
