"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchRoutes, type SearchEntry } from "@/lib/constants/search-index";

/**
 * Owns the global nav-search: query state, ranked route matches, keyboard
 * navigation (↑/↓/Enter/Esc) and outside-click dismissal. The view is a thin
 * input + results list bound to what this returns.
 */
export function useGlobalSearch() {
  const router = useRouter();
  const [query, setQueryRaw] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const results: SearchEntry[] = useMemo(() => searchRoutes(query), [query]);

  // Reset the highlight to the top row on every new query (no effect needed).
  const setQuery = (value: string) => {
    setQueryRaw(value);
    setActiveIndex(0);
  };

  // Dismiss when clicking outside the search box.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const go = (entry: SearchEntry | undefined) => {
    if (!entry) return;
    router.push(entry.href);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[activeIndex]);
    }
  };

  const showResults = open && query.trim().length > 0;

  return {
    query,
    setQuery,
    open,
    setOpen,
    results,
    activeIndex,
    setActiveIndex,
    onKeyDown,
    go,
    showResults,
    containerRef,
  };
}
