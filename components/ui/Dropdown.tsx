"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { FONT } from "@/lib/ui/styles";

/**
 * SIZING RULE: `w-full` is only correct inside a width-capped container
 * (a Modal, a card grid, or a form wrapper with max-w). In a full-width
 * content column, cap the wrapper (e.g. max-w-[640px] for a form,
 * w-[320px] for a lone select) so fields keep standard sizes.
 */
export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  height?: number;
  placeholder?: string;
  disabled?: boolean;
  /** Extra classes merged onto the trigger (e.g. `w-full`, a white background). */
  className?: string;
  /** Show a filter box at the top of the menu — for long lists. */
  searchable?: boolean;
}

/**
 * The house custom select — used everywhere instead of a native `<select>`.
 * The menu renders through a portal with fixed positioning so it never gets
 * clipped by an `overflow` ancestor (modals, scrollable tables, etc.).
 */
export function Dropdown({ value, onChange, options, height, placeholder, disabled, className, searchable }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => { setOpen(false); setQuery(""); };

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const onDocPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      close();
    };
    const reposition = () => place();
    document.addEventListener("mousedown", onDocPointer);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, place]);

  const selected = options.find((o) => o.value === value);
  const filtered =
    searchable && query.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : options;

  return (
    <div ref={triggerRef} className="relative">
      <div
        onClick={() => { if (!disabled) { if (open) close(); else setOpen(true); } }}
        className={`box-border flex select-none items-center justify-between gap-2 rounded-[8px] border bg-[#F4F6FB] px-3 py-2 text-[14px] font-semibold ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${open ? "border-[#081340]" : "border-[#DAE0EF]"} ${selected ? "text-[#081340]" : "text-[#8B93AD]"} ${className ?? ""}`}
        style={{ fontFamily: FONT, height: height || 38 }}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{selected?.label || placeholder || ""}</span>
        <ChevronDown size={14} color="#8B93AD" className="shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>
      {open && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] overflow-hidden rounded-[8px] border border-[#DAE0EF] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
          style={{ top: coords.top, left: coords.left, width: coords.width, fontFamily: FONT }}
        >
          {searchable && (
            <div className="border-b border-[#F4F6FB] p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="box-border h-[34px] w-full rounded-[8px] border border-[#DAE0EF] px-[10px] text-[14px] text-[#081340] outline-none"
                style={{ fontFamily: FONT }}
              />
            </div>
          )}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-[9px] text-[14px] text-[#8B93AD]">No matches</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); close(); }}
                  className={`cursor-pointer px-3 py-[9px] text-[14px] ${opt.value === value ? "bg-[rgba(8, 19, 64,0.06)] font-bold text-[#081340]" : "bg-transparent font-normal text-[#081340]"}`}
                  onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = "#F4F6FB"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = opt.value === value ? "rgba(8, 19, 64,0.06)" : "transparent"; }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
