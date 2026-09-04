"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Mic2, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/lib/summit/search";
import { fmtSummitTime } from "@/lib/summit/time";

interface Row {
  key: string;
  group: "Sessions" | "Speakers" | "Delegates";
  label: string;
  detail: string;
  href: string;
}

const fmt = fmtSummitTime;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isFetching } = useSearch(open ? term : "");

  // Global shortcut: ⌘K / Ctrl+K opens, Esc closes. Registered once because
  // this component is mounted in the persistent layout.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else {
      setTerm("");
      setCursor(0);
    }
  }, [open]);

  const rows = useMemo<Row[]>(() => {
    if (!data) return [];
    return [
      ...data.sessions.map((s) => ({
        key: `s-${s.id}`,
        group: "Sessions" as const,
        label: s.title,
        detail: `Day ${s.day} · ${fmt(s.startsAt)} · ${s.room} · ${s.status}`,
        href: "/sessions",
      })),
      ...data.speakers.map((s) => ({
        key: `p-${s.id}`,
        group: "Speakers" as const,
        label: s.name,
        detail: [s.role, s.organisation].filter(Boolean).join(" · ") || "Speaker",
        href: "/sessions",
      })),
      ...data.delegates.map((d) => ({
        key: `d-${d.id}`,
        group: "Delegates" as const,
        label: d.name,
        detail: [d.title, d.organisation, d.country].filter(Boolean).join(" · ") || "Delegate",
        href: "/delegates",
      })),
    ];
  }, [data]);

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, rows.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    }
    if (e.key === "Enter" && rows[cursor]) {
      router.push(rows[cursor].href);
      setOpen(false);
    }
  }

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center bg-summit-violet/80 p-4 pt-[12vh] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-summit-lilac/[0.18] bg-summit-violet/95 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-3 border-b border-summit-lilac/10 px-5 py-4">
          <Search className="size-4 shrink-0 text-summit-smoke" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search sessions, speakers, delegates…"
            className="flex-1 bg-transparent text-sm text-summit-lilac outline-none placeholder:text-summit-smoke/60"
          />
          {isFetching && <span className="text-[11px] text-summit-smoke">…</span>}
          <kbd className="rounded bg-summit-lilac/10 px-1.5 py-0.5 text-[10px] text-summit-smoke">esc</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {term.trim().length < 2 && (
            <p className="px-3 py-6 text-center text-sm text-summit-smoke">
              Type at least two characters.
            </p>
          )}
          {term.trim().length >= 2 && rows.length === 0 && !isFetching && (
            <p className="px-3 py-6 text-center text-sm text-summit-smoke">
              Nothing matches “{term}”.
            </p>
          )}
          {rows.map((row, i) => {
            const header = row.group !== lastGroup ? ((lastGroup = row.group), row.group) : null;
            const Icon =
              row.group === "Sessions" ? CalendarClock : row.group === "Speakers" ? Mic2 : Users;
            return (
              <div key={row.key}>
                {header && (
                  <p className="px-3 pt-3 pb-1 text-[11px] tracking-[0.1em] text-summit-smoke uppercase">
                    {header}
                  </p>
                )}
                <button
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    router.push(row.href);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                    i === cursor ? "bg-summit-cerise/20" : "hover:bg-summit-lilac/5",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-summit-smoke" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-summit-lilac">{row.label}</span>
                    <span className="block truncate text-xs text-summit-smoke">{row.detail}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
