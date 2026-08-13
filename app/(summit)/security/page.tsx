"use client";

import { useState } from "react";
import { AlertTriangle, Info, TriangleAlert
 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SEVERITIES,
  useOlderEvents,
  useSecurityEvents,
  type Severity,
} from "@/lib/summit/security";

const SEVERITY_STYLES: Record<Severity, string> = {
  info: "bg-summit-cerulean/15 text-summit-cerulean",
  warning: "bg-summit-cream/15 text-summit-cream",
  critical: "bg-summit-cerise/20 text-summit-cerise",
};

const SEVERITY_ICONS: Record<Severity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: TriangleAlert,
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SecurityPage() {
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const { data: events, isLoading, error } = useSecurityEvents(severity);
  const older = useOlderEvents();

  const last = events?.[events.length - 1];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Security
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Audit trail — every admin action and security event, newest first.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", ...SEVERITIES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeverity(s)}
            className={cn(
              "rounded-full px-3 py-1 text-xs capitalize transition-colors",
              severity === s
                ? "bg-summit-cerise text-white"
                : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-summit-smoke">Loading events…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load events — {(error as Error).message}
        </div>
      )}
      {!isLoading && !error && (events ?? []).length === 0 && (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          No events{severity !== "all" ? ` at “${severity}”` : ""} yet.
        </div>
      )}

      {(events ?? []).length > 0 && (
        <section className="glass-card p-5">
          <ul className="flex flex-col divide-y divide-summit-lilac/10">
            {(events ?? []).map((ev) => {
              const Icon = SEVERITY_ICONS[ev.severity];
              return (
                <li key={ev.id} className="flex items-start gap-3 py-3">
                  <span className={cn("mt-0.5 rounded-full p-1.5", SEVERITY_STYLES[ev.severity])}>
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{ev.type}</p>
                    <p className="text-xs text-summit-smoke">{ev.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-summit-smoke">{fmtTime(ev.createdAt)}</span>
                </li>
              );
            })}
          </ul>
          {last && (events ?? []).length >= 50 && (
            <button
              onClick={() => older.mutate({ before: last.createdAt, severity })}
              disabled={older.isPending}
              className="mt-3 w-full rounded-[20px] bg-summit-lilac/10 px-4 py-2 text-sm text-summit-smoke hover:text-summit-lilac disabled:opacity-50"
            >
              {older.isPending ? "Loading…" : "Load older events"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
