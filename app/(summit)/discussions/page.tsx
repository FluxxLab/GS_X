"use client";

import { useState } from "react";
import { Download, EyeOff, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessions } from "@/lib/summit/sessions";
import {
  exportThread,
  exportTranscript,
  useHideComment,
  useModerationThread,
  useTranscript,
} from "@/lib/summit/discussions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputCls =
  "rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac focus:border-summit-cerise";

type Tab = "thread" | "transcript" | "digest";

export default function DiscussionsPage() {
  const { data: sessions } = useSessions();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("thread");
  const selected = (sessions ?? []).find((s) => s.id === sessionId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Discussions &amp; Harvest
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Moderate the live thread; harvest the transcript and digest after.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={sessionId ?? "none"} onValueChange={(val) => setSessionId(val === "none" ? null : val)}>
          <SelectTrigger className={cn(inputCls, "min-w-72 w-auto")}>
            <SelectValue placeholder="Pick a session…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Pick a session…</SelectItem>
            {(sessions ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                Day {s.day} · {s.title} ({s.room})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && (
          <div className="flex gap-2">
            {(["thread", "transcript", "digest"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-[20px] px-4 py-2 text-sm capitalize transition-colors",
                  tab === t
                    ? "bg-summit-cerise text-white"
                    : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {!selected && (
        <div className="glass-card p-8 text-sm text-summit-smoke">
          Pick a session to see its thread, transcript, and digest.
        </div>
      )}

      {selected && tab === "thread" && <ThreadTab sessionId={selected.id} title={selected.title} />}
      {selected && tab === "transcript" && (
        <TranscriptTab sessionId={selected.id} title={selected.title} />
      )}
      {selected && tab === "digest" && (
        <div className="glass-card p-8 text-sm text-summit-smoke">
          AI digest isn&apos;t available yet — the backend summariser hasn&apos;t shipped. This tab
          lights up automatically when it does.
        </div>
      )}
    </div>
  );
}

function ThreadTab({ sessionId, title }: { sessionId: string; title: string }) {
  const { data: comments, isLoading, error } = useModerationThread(sessionId);
  const hide = useHideComment(sessionId);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => exportThread(title, sessionId, "csv")}
          disabled={!comments?.length}
          className="flex items-center gap-2 rounded-[20px] bg-summit-lilac/10 px-3 py-1.5 text-xs text-summit-smoke hover:text-summit-lilac disabled:opacity-50"
        >
          <Download className="size-3.5" /> CSV
        </button>
        <button
          onClick={() => exportThread(title, sessionId, "json")}
          disabled={!comments?.length}
          className="flex items-center gap-2 rounded-[20px] bg-summit-lilac/10 px-3 py-1.5 text-xs text-summit-smoke hover:text-summit-lilac disabled:opacity-50"
        >
          <Download className="size-3.5" /> JSON
        </button>
                <span className="self-center text-[11px] text-summit-smoke">
          Exports are logged to security events
        </span>

      </div>

      {isLoading && <p className="text-sm text-summit-smoke">Loading thread…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load thread — {(error as Error).message}
        </div>
      )}

      <section className="glass-card p-5">
        <ul className="flex flex-col divide-y divide-summit-lilac/10">
          {(comments ?? []).map((c) => (
            <li key={c.id} className={cn("flex items-start gap-3 py-3", c.hiddenAt && "opacity-40")}>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{c.body}</p>
                <p className="mt-1 text-xs text-summit-smoke">
                  {new Date(c.createdAt).toLocaleTimeString("en-GB")} · author {c.authorId.slice(0, 8)}
                  {c.hiddenAt && " · hidden"}
                </p>
              </div>
              {c.flagged && !c.hiddenAt && (
                <span className="flex items-center gap-1 rounded-full bg-summit-cerise/20 px-2 py-0.5 text-[11px] text-summit-cerise">
                  <Flag className="size-3" /> flagged
                </span>
              )}
              {!c.hiddenAt && (
                <button
                  onClick={() => hide.mutate(c.id)}
                  disabled={hide.isPending}
                  className="flex items-center gap-1.5 rounded-[20px] bg-summit-lilac/10 px-3 py-1 text-xs text-summit-smoke hover:text-summit-lilac disabled:opacity-50"
                >
                  <EyeOff className="size-3.5" /> Hide
                </button>
                
              )}
                      <span className="self-center text-[11px] text-summit-smoke">
          Exports are logged to security events
        </span>

            </li>
          ))}
          {!isLoading && (comments ?? []).length === 0 && (
            <li className="py-4 text-sm text-summit-smoke">No comments on this session yet.</li>
          )}
        </ul>
      </section>
    </>
  );
}

function TranscriptTab({ sessionId, title }: { sessionId: string; title: string }) {
  const { data: segments, isLoading, error } = useTranscript(sessionId);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => exportTranscript(title, sessionId, "csv")}
          disabled={!segments?.length}
          className="flex items-center gap-2 rounded-[20px] bg-summit-lilac/10 px-3 py-1.5 text-xs text-summit-smoke hover:text-summit-lilac disabled:opacity-50"
        >
          <Download className="size-3.5" /> CSV
        </button>
                <span className="self-center text-[11px] text-summit-smoke">
          Exports are logged to security events
        </span>

        <button
          onClick={() => exportTranscript(title, sessionId, "txt")}
          disabled={!segments?.length}
          className="flex items-center gap-2 rounded-[20px] bg-summit-lilac/10 px-3 py-1.5 text-xs text-summit-smoke hover:text-summit-lilac disabled:opacity-50"
        >
          <Download className="size-3.5" /> TXT
        </button>
                <span className="self-center text-[11px] text-summit-smoke">
          Exports are logged to security events
        </span>

      </div>

      {isLoading && <p className="text-sm text-summit-smoke">Loading transcript…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load transcript — {(error as Error).message}
        </div>
      )}

      <section className="glass-card p-5">
        <ul className="flex flex-col gap-2">
          {(segments ?? []).map((s) => (
            <li key={s.id} className="flex gap-3 text-sm">
              <span className="w-20 shrink-0 text-xs text-summit-smoke">
                {new Date(s.createdAt).toLocaleTimeString("en-GB")}
              </span>
              <p className="min-w-0">
                {s.text}
                {s.source === "ai" && (
                  <span className="ml-2 rounded-full bg-summit-cerulean/15 px-1.5 py-0.5 text-[10px] text-summit-cerulean uppercase">
                    ai
                  </span>
                )}
              </p>
            </li>
          ))}
          {!isLoading && (segments ?? []).length === 0 && (
            <li className="text-sm text-summit-smoke">
              No transcript yet — segments appear once the room&apos;s capture runs during a live
              session.
            </li>
          )}
        </ul>
      </section>
    </>
  );
}
