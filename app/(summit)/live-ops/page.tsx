"use client";

import { Mic, MicOff, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCutToBreak,
  useLiveOpsOverview,
  useSetOverlays,
} from "@/lib/summit/live-ops";

export default function LiveOpsOverview(){
    const {data, isLoading, error} = useLiveOpsOverview();
  const cutToBreak = useCutToBreak();
  const setOverlays = useSetOverlays();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Live Ops
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Broadcast control — changes reach every delegate in under a second.
        </p>
      </header>

      {isLoading && <p className="text-sm text-summit-smoke">Loading broadcast state…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load live ops — {(error as Error).message}
        </div>
      )}


      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          On air now
        </h2>
        {data && data.sessions.length === 0 && (
          <div className="glass-card p-5 text-sm text-summit-smoke">
            Nothing live right now — set a session to “live” on the Sessions page.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {data?.sessions.map((s) => {
            const onCutToBreak = () => {
              const activating = !s.flags.cutToBreak;
              const ok = window.confirm(
                activating
                  ? "Cut stream to the break screen? Every delegate sees this immediately."
                  : "Resume broadcast and end the break?",
              );
              if (ok) cutToBreak.mutate({ sessionId: s.id, active: activating });
            };

            return (
              <article key={s.id} className="glass-card flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-summit-smoke">{s.room}</p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide shrink-0",
                      s.capturing
                        ? "bg-summit-green/15 text-summit-green"
                        : "bg-summit-cerise/15 text-summit-cerise",
                    )}
                  >
                    {s.capturing ? <Mic className="size-3" /> : <MicOff className="size-3" />}
                    {s.capturing ? "capturing" : "no feed"}
                  </span>
                </div>
                <div className="flex gap-5 text-sm text-summit-smoke border-b border-summit-lilac/10 pb-4">
                  <span className="flex items-center gap-1.5">
                    <Radio className="size-3.5" /> {s.viewers} in session
                  </span>
                  <span>{s.captionListeners} on captions</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onCutToBreak}
                    disabled={cutToBreak.isPending}
                    className={cn(
                      "rounded-[20px] px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50",
                      s.flags.cutToBreak
                        ? "bg-summit-cerise text-white"
                        : "border border-summit-lilac/20 text-summit-lilac",
                    )}
                  >
                    {s.flags.cutToBreak ? "ON BREAK — resume broadcast" : "Cut to break"}
                  </button>
                  <div className="flex gap-6 mt-1">
                    <FlagToggle
                      label="Captions"
                      checked={s.flags.captionsOverlay}
                      pending={setOverlays.isPending}
                      onChange={(v) => setOverlays.mutate({ sessionId: s.id, captions: v })}
                    />
                    <FlagToggle
                      label="Sign-language"
                      checked={s.flags.signLanguageOverlay}
                      pending={setOverlays.isPending}
                      onChange={(v) => setOverlays.mutate({ sessionId: s.id, signLanguage: v })}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FlagToggle({
  label, checked, pending, onChange,
}: {
  label: string;
  checked: boolean;
  pending: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-summit-cerise"
      />
      {label}
    </label>
  );
}


