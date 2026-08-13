"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SESSION_STATUSES,
  useSessions,
  useUpdateSessionStatus,
  type Session,
  type SessionStatus,
} from "@/lib/summit/sessions";
import { SessionForm } from "@/app/(summit)/_components/SessionForm";

const STATUS_STYLES: Record<SessionStatus, string> = {
  scheduled: "bg-summit-lilac/10 text-summit-smoke",
  live: "bg-summit-cerise text-white",
  completed: "bg-summit-green/15 text-summit-green",
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function SessionsPage(){
    const {data: sessions, isLoading, error} = useSessions();
    const updateStatus = useUpdateSessionStatus();
    const [editing, setEditing] = useState<Session | null>(null);
    const [creating, setCreating] = useState(false);


    const days =[...new Set((sessions ?? []).map((s) => s.day))].sort();

    return (
<div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
            Sessions
          </h1>
          <p className="mt-1 text-sm text-summit-smoke">
            Agenda control — status changes go live to delegates instantly.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setCreating(true); }}
          className="flex items-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" /> New session
        </button>
      </header>

      {(creating || editing) && (
        <SessionForm
          session={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}

      {isLoading && <p className="text-sm text-summit-smoke">Loading agenda…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load sessions — {(error as Error).message}
        </div>
      )}
      {!isLoading && !error && days.length === 0 && (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          No sessions yet — create the first one above.
        </div>
      )}

      {days.map((day) => (
        <section key={day} className="glass-card p-5">
          <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
            Day {day}
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
            {(sessions ?? [])
              .filter((s) => s.day === day)
              .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
              .map((s) => (
                <li key={s.id} className="flex items-center gap-4 py-3">
                  <span className="w-24 shrink-0 text-sm text-summit-smoke">
                    {fmtTime(s.startsAt)}–{fmtTime(s.endsAt)}
                  </span>
                  <button
                    onClick={() => { setCreating(false); setEditing(s); }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-summit-smoke">
                      {s.room} · {s.type}
                    </p>
                  </button>
                  <span className="rounded-full bg-summit-cerulean/15 px-2.5 py-0.5 text-[11px] tracking-wide text-summit-cerulean uppercase">
                    {s.track}
                  </span>
                  <select
                    value={s.status}
                    disabled={updateStatus.isPending}
                    onChange={(e) =>
                      updateStatus.mutate({ id: s.id, status: e.target.value as SessionStatus })
                    }
                    className={cn(
                      "cursor-pointer rounded-full border-0 px-3 py-1 text-xs outline-none",
                      STATUS_STYLES[s.status],
                    )}
                  >
                    {SESSION_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-summit-violet text-summit-lilac">
                        {st}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
    );
}