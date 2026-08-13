 "use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import { FONT } from "@/lib/ui/styles";

export interface KebabAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

/**
 * Reusable row-actions (⋮) menu. Encapsulates the trigger, fixed positioning,
 * and outside-click / scroll-close behavior that used to live in every page.
 */
export function KebabMenu({ actions, icon }: { actions: KebabAction[]; icon?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    const btn = e.currentTarget.getBoundingClientRect();
    setPos({ top: btn.bottom + 4, left: btn.right - 180 });
    setOpen((v) => !v);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] border-none ${open ? "bg-[#F4F6FB]" : "bg-transparent"}`}
      >
        {icon ?? <MoreVertical size={16} color="#70768E" />}
      </button>
      {open && (
        <div ref={menuRef} className="fixed z-[9999] min-w-[180px] rounded-[8px] border border-[#DAE0EF] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]" style={{ top: pos.top, left: pos.left }}>
          {actions.map((a, i) => (
            <div key={a.label}>
              {i > 0 && a.danger && <div className="my-1 h-px bg-[#F4F6FB]" />}
              <button
                onClick={() => { a.onClick(); setOpen(false); }}
                className={`flex w-full cursor-pointer items-center gap-2.5 border-none bg-none px-4 py-[10px] text-left text-[13px] font-medium ${a.danger ? "text-[#EF4444]" : "text-[#081340]"}`}
                style={{ fontFamily: FONT }}
                onMouseEnter={(e) => (e.currentTarget.style.background = a.danger ? "#FEF2F2" : "#F4F6FB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {a.icon} {a.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
