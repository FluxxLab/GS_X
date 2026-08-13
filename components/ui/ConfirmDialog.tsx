"use client";

import { FONT } from "@/lib/ui/styles";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Reusable confirmation modal (replaces per-page confirm-modal blocks). */
export function ConfirmDialog({
  open,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" style={{ fontFamily: FONT }}>
      <div className="absolute inset-0 bg-[rgba(8, 19, 64,0.5)] backdrop-blur-[4px]" onClick={onCancel} />
      <div className="relative w-[400px] rounded-[8px] bg-white p-8">
        <h3 className="m-0 mb-2 text-[18px] font-extrabold text-[#081340]">{title}</h3>
        <p className="m-0 mb-6 text-[14px] leading-[22px] text-[#70768E]">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="cursor-pointer rounded-[6px] border border-[#DAE0EF] bg-white px-5 py-[10px] text-[13px] font-semibold text-[#081340]" style={{ fontFamily: FONT }}>{cancelLabel}</button>
          <button onClick={onConfirm} className={`cursor-pointer rounded-[6px] border-none px-5 py-[10px] text-[13px] font-bold text-white ${danger ? "bg-[#DC2626]" : "bg-[#081340]"}`} style={{ fontFamily: FONT }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
