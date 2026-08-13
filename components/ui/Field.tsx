"use client";

import type { ReactNode } from "react";
import { FONT } from "@/lib/ui/styles";

/** Label + control wrapper used throughout the finance forms. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-semibold text-[#081340]" style={{ fontFamily: FONT }}>{label}</label>
      {children}
    </div>
  );
}
