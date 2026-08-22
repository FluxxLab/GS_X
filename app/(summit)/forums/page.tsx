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

      <section>
        <h2 className="text-[11px] tracking-[0.1em] text-summit-smoke uppercase">
          Boards ({boards.length})
        </h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {boards.length === 0 && (
            <p className="text-sm text-summit-smoke">
              No sessions yet. Every session is a board, so create one and it appears here.
            </p>
          )}
          {boards.map((t) => (
            <button
              key={t.sessionId}
              type="button"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  sessionId: f.sessionId === t.sessionId ? undefined : t.sessionId,
                }))
              }
              className={cn(
                "glass-card flex flex-col gap-1 p-3 text-left transition-colors",
                filters.sessionId === t.sessionId
                  ? "border border-summit-cerise"
                  : "hover:border-summit-lilac/30",
              )}
            >
              <span className="truncate text-sm text-summit-lilac">{t.title}</span>
              <span className="flex flex-wrap gap-2 text-xs text-summit-smoke">
                <span>{t.track}</span>
                <span>
                  {t.comments} comment{t.comments === 1 ? "" : "s"}
                </span>
                {t.flagged > 0 && (
                  <span className="text-summit-cream">{t.flagged} reported</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="glass-card flex flex-wrap items-center gap-3 p-4">
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
            : "Nothing here yet. Boards are listed above; comments appear once delegates post from the app."}
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
