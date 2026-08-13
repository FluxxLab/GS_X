"use client";
import { useOverview } from "@/lib/summit/overview";
import { TrendingUp } from "lucide-react";


export default function Overview(){
 const {data: data, isLoading, error} = useOverview();

  const metrics = [
    { label: "Delegates", value: data?.delegate.total, accent: "text-summit-cerise" },
    { label: "Streaming", value: data?.streaming, accent: "text-summit-cerulean" },
    { label: "Live sessions", value: data?.sessions.live, accent: "text-summit-cerise" },
    { label: "Flagged", value: data?.delegate.flagged, accent: "text-summit-cream" },
  ];

  const viewers = data?.viewersPerSession ?? [];
  const maxViewers = Math.max(1, ...viewers.map((v) => v.viewers));
  const pitches = data?.topPitches ?? [];
  const maxVotes = Math.max(1, ...pitches.map((p) => p.voteCount));
 return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Overview
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Real-time summit operations at a glance.
        </p>
      </header>

      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load overview — {(error as Error).message}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="glass-card p-5">
            <p className="text-[11px] tracking-[0.1em] text-summit-smoke uppercase">{m.label}</p>
            <p
              className={`mt-2 font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.02em] ${m.accent}`}
            >
              {isLoading ? "—" : (m.value ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
              Viewers per live session
            </h2>
            <span className="text-xs text-summit-smoke">now</span>
          </div>
          {viewers.length === 0 ? (
            <p className="mt-4 text-sm text-summit-smoke">
              No sessions are live right now — bars appear when a session goes live.
            </p>
          ) : (
            <div className="mt-4 flex h-40 items-end justify-center gap-4">
              {viewers.map((v) => (
                <div key={v.sessionsId} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs text-summit-smoke">{v.viewers}</span>
                  <div
                    style={{ height: `${(v.viewers / maxViewers) * 80}%` }}
                    className="w-full max-w-12 rounded-t-[14px] bg-gradient-to-t from-summit-cerise to-summit-cerulean opacity-80"
                  />
                  <span className="w-full truncate text-center text-[11px] text-summit-smoke">
                    {v.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
            Top pitches
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {pitches.length === 0 && (
              <li className="text-sm text-summit-smoke">No votes yet.</li>
            )}
            {pitches.map((p) => (
              <li key={p.entryId.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{p.entryId.innovatorName}</span>
                  <span className="shrink-0 text-summit-smoke">{p.voteCount}</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-white/10">
                  <div
                    style={{ width: `${(p.voteCount / maxVotes) * 100}%` }}
                    className="h-full rounded-full bg-summit-cerise"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

