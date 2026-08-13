"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { FONT } from "@/lib/ui/styles";

interface Props {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Singular noun for the count summary (e.g. "customer"). */
  noun?: string;
}

/** A windowed list of page numbers around the current page (max 5). */
function pageWindow(page: number, totalPages: number): number[] {
  const max = 5;
  if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);
  let start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Shared table pager: "Showing X–Y of Z" + prev / windowed page numbers / next.
 * Always shown when there's at least one row (the page controls disable
 * themselves when everything fits on a single page).
 */
export function TablePagination({ page, pageSize, total, onPageChange, noun }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = pageWindow(page, totalPages);

  return (
    <div
      className="flex items-center justify-between border-t border-[#DAE0EF] px-5 py-[14px]"
      style={{ fontFamily: FONT }}
    >
      <span className="text-[13px] text-[#70768E]">
        Showing <strong className="text-[#081340]">{from}-{to}</strong> of{" "}
        <strong className="text-[#081340]">{total.toLocaleString()}</strong>
        {noun ? ` ${noun}${total === 1 ? "" : "s"}` : ""}
      </span>
      <div className="flex gap-[6px]">
        <PageBtn disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={14} />
        </PageBtn>
        {pages.map((p) => (
          <PageBtn key={p} active={p === page} onClick={() => onPageChange(p)}>
            {p}
          </PageBtn>
        ))}
        <PageBtn disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight size={14} />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex h-[34px] min-w-[34px] items-center justify-center rounded-[6px] px-2 text-[14px] ${
        active
          ? "border-none bg-[#081340] font-bold text-white"
          : "border border-[#DAE0EF] bg-white font-normal text-[#70768E]"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      style={{ fontFamily: FONT }}
    >
      {children}
    </button>
  );
}
