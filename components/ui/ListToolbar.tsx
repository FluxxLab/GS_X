"use client";

import { Plus, Search } from "lucide-react";
import { FONT, btnPrimary } from "@/lib/ui/styles";

export interface FilterTab<T> {
  label: string;
  value: T;
}

interface ListToolbarProps<T> {
  title: string;
  subtitle: string;
  addLabel: string;
  onAdd: () => void;
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder: string;
  filterTabs: FilterTab<T>[];
  activeFilter: T;
  onFilterChange: (v: T) => void;
  count: number;
  countNoun: string;
}

/**
 * Shared list-page header + search/filter bar. One source of truth for the
 * title block, "Add" button, search box, filter tabs, and result count that
 * every CRUD list page repeats.
 */
export function ListToolbar<T>({
  title, subtitle, addLabel, onAdd,
  search, onSearchChange, searchPlaceholder,
  filterTabs, activeFilter, onFilterChange,
  count, countNoun,
}: ListToolbarProps<T>) {
  return (
    <>
      {/* Header */}
      <div className="flex items-end justify-between px-7 pb-5">
        <div>
          <h1 className="m-0 text-[30px] font-black leading-[36px] tracking-[-0.75px] text-[#081340]">{title}</h1>
          <p className="mt-1 mb-0 text-[16px] font-medium leading-[24px] text-[#70768E]">{subtitle}</p>
        </div>
        <button onClick={onAdd} style={btnPrimary}><Plus size={14} color="#FFFFFF" /> {addLabel}</button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 border-t border-b border-[#DAE0EF] px-7 py-4">
        <div className="relative">
          <Search size={14} color="#8B93AD" className="absolute left-[10px] top-1/2 -translate-y-1/2" />
          <input type="text" placeholder={searchPlaceholder} value={search} onChange={(e) => onSearchChange(e.target.value)} className="h-[34px] w-[260px] rounded-[8px] border border-[#DAE0EF] py-[7px] pr-3 pl-[30px] text-[13px] outline-none" style={{ fontFamily: FONT }} />
        </div>
        <div className="flex gap-2">
          {filterTabs.map((t) => {
            const isActive = activeFilter === t.value;
            return (
              <button key={t.label} onClick={() => onFilterChange(t.value)} className={`h-[34px] cursor-pointer rounded-[6px] px-3 py-1.5 text-[13px] ${isActive ? "border border-[rgba(8, 19, 64,0.2)] bg-[rgba(8, 19, 64,0.1)] font-bold text-[#081340]" : "border-none bg-transparent font-medium text-[#70768E]"}`} style={{ fontFamily: FONT }}>
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#70768E]">{count} {countNoun}{count !== 1 ? "s" : ""}</span>
      </div>
    </>
  );
}
