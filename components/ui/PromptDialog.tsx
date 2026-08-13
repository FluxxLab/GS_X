"use client";

import { useState } from "react";
import { FONT, PRIMARY } from "@/lib/ui/styles";

interface PromptDialogProps {
  open: boolean;
  title: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

/** Reusable single-textarea prompt (e.g. "rejection reason"). */
export function PromptDialog({ open, title, placeholder, submitLabel = "Submit", onSubmit, onCancel }: PromptDialogProps) {
  const [value, setValue] = useState("");

  // Clear the field on the way out so the next open starts fresh — no effect needed.
  const handleSubmit = () => { onSubmit(value); setValue(""); };
  const handleCancel = () => { onCancel(); setValue(""); };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" style={{ fontFamily: FONT }}>
      <div className="absolute inset-0 bg-[rgba(8, 19, 64,0.5)] backdrop-blur-[4px]" onClick={handleCancel} />
      <div className="relative w-[420px] rounded-[8px] bg-white p-8">
        <h3 className="m-0 mb-4 text-[18px] font-extrabold text-[#081340]">{title}</h3>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          rows={3}
          className="mb-6 box-border w-full resize-y rounded-[8px] border border-[#DAE0EF] px-[14px] py-[10px] text-[14px] text-[#081340] outline-none"
          style={{ fontFamily: FONT }}
        />
        <div className="flex justify-end gap-3">
          <button onClick={handleCancel} className="cursor-pointer rounded-[6px] border border-[#DAE0EF] bg-white px-5 py-[10px] text-[13px] font-semibold text-[#081340]" style={{ fontFamily: FONT }}>Cancel</button>
          <button onClick={handleSubmit} className="cursor-pointer rounded-[6px] border-none bg-[#081340] px-5 py-[10px] text-[13px] font-bold text-white" style={{ fontFamily: FONT }}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
