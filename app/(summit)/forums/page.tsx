"use client";

import { useState } from "react";
import { EyeOff, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useForumComments,
  useForumThreads,
  useHideForumComment,
  type ForumFilters,
  type HiddenFilter,
} from "@/lib/summit/forums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Same trigger styling as the session picker on Discussions & Harvest, so the
// two moderation pages read as one tool.
const inputCls =
  "rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac focus:border-summit-cerise";

// Radix Select forbids an empty-string item value, so "all boards" needs a
// sentinel that can never collide with a session id.
const ALL_BOARDS = "all";

const CHIP =
  "rounded-full px-3 py-1 text-xs transition-colors bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac";
const CHIP_ON = "bg-summit-cerise text-white";

const HIDDEN_TABS: { value: HiddenFilter; label: string }[] = [
  { value: "include", label: "All" },
  { value: "exclude", label: "Visible only" },
  { value: "only", label: "Hidden only" },
];

export default function ForumsPage() {
  const [filters, setFilters] = useState<ForumFilters>({ hidden: "include" });
  const { data: comments, isLoading, error } = useForumComments(filters);
  const { data: threads } = useForumThreads();
  const hide = useHideForumComment();

  const rows = comments ?? [];
  const boards = threads ?? [];
  const selected = boards.find((t) => t.sessionId === filters.sessionId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Forums
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Every discussion thread across every session, newest first. Hiding a comment is
          logged as a security event.
        </p>
      </header>

      <div className="glass-card flex flex-wrap items-center gap-3 p-4">
        {/*
          One board per session. A dropdown instead of a card grid: with 90+
          sessions the grid pushed the comment list below the fold, and the
          per-board counts read better as one line per option.
        */}
        <Select
          value={filters.sessionId ?? ALL_BOARDS}
          onValueChange={(val) =>
            setFilters((f) => ({
              ...f,
              sessionId: val === ALL_BOARDS ? undefined : val,
            }))
          }
        >
          <SelectTrigger className={cn(inputCls, "w-72")}>
            <SelectValue placeholder="All boards" />
          </SelectTrigger>
          {/*
            Height and width both have to be pinned. Left alone the panel grows
            to 90-odd rows tall (the primitive only caps it at the viewport) and
            as wide as the longest session title, which covers the page. The
            width is tied to the trigger so titles truncate instead of stretching
            it, and the list scrolls past roughly eight rows.
          */}
          <SelectContent className="max-h-72 w-(--radix-select-trigger-width)">
            <SelectItem value={ALL_BOARDS}>
              All boards ({boards.length})
            </SelectItem>
            {boards.map((t) => (
              <SelectItem key={t.sessionId} value={t.sessionId}>
                {/* One column, not one line: at trigger width a title and its
                    counts cannot share a row without the title vanishing.
                    The width is stated outright rather than left to min-w-0,
                    because Radix's ItemText wrapper gives the flex column no
                    width to resolve against - so `truncate` clipped the title
                    dead at the border instead of showing an ellipsis. The 3rem
                    is the item's own pl-1.5 + pr-8, which keeps long titles
                    clear of the tick. */}
                <span className="flex w-[calc(var(--radix-select-trigger-width)-3rem)] flex-col items-start gap-0.5">
                  <span className="w-full truncate">{t.title}</span>
                  <span className="text-xs text-summit-smoke">
                    {t.track} · {t.comments} comment{t.comments === 1 ? "" : "s"}
                    {t.flagged > 0 && (
                      <span className="text-summit-cream"> · {t.flagged} reported</span>
                    )}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setFilters((f) => ({ ...f, flagged: !f.flagged }))}
          className={cn(CHIP, filters.flagged && CHIP_ON)}
        >
          <Flag className="mr-1 inline size-3" />
          Reported only
        </button>

        <div className="flex flex-wrap gap-1">
          {HIDDEN_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, hidden: t.value }))}
              className={cn(CHIP, (filters.hidden ?? "include") === t.value && CHIP_ON)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-summit-smoke">
          {selected ? `${selected.title}: ` : ""}
          {rows.length} comment{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading && <p className="text-sm text-summit-smoke">Loading threads…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load threads: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          {selected
            ? `No comments in "${selected.title}" yet.`
            : boards.length === 0
              ? "No sessions yet. Every session is a board, so create one and it appears in the dropdown."
              : "Nothing here yet. Pick a board from the dropdown, or wait for delegates to post from the app."}
        </div>
      )}

      <section className="flex flex-col gap-2">
        {rows.map((c) => {
          const hidden = c.hiddenAt !== null;
          return (
            <article
              key={c.id}
              className={cn("glass-card flex flex-col gap-2 p-4", hidden && "opacity-60")}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-summit-smoke">
                <span className="text-summit-lilac">{c.authorName}</span>
                {c.authorOrganisation && <span>· {c.authorOrganisation}</span>}
                <span>· {c.sessionTitle}</span>
                <span>· {new Date(c.createdAt).toLocaleString("en-GB")}</span>
                {c.flagged && (
                  <span className="rounded-full bg-summit-cream/15 px-2 py-0.5 text-summit-cream">
                    reported
                  </span>
                )}
                {hidden && (
                  <span className="rounded-full bg-summit-lilac/15 px-2 py-0.5">hidden</span>
                )}
              </div>

              <p className="text-sm text-summit-lilac">{c.body}</p>

              {!hidden && (
                <div>
                  <button
                    type="button"
                    onClick={() => hide.mutate(c.id)}
                    disabled={hide.isPending}
                    className="flex items-center gap-1 rounded-[20px] bg-summit-cerise px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  >
                    <EyeOff className="size-3" />
                    Hide
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
