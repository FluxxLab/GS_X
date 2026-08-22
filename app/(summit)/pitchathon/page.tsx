"use client";

import { useMemo, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracks, type Track } from "@/lib/summit/sessions";
import { usePitchEntries, useCreatePitchEntry } from "@/lib/summit/voting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";

const EMPTY = {
  innovatorName: "",
  country: "",
  track: "" as Track,
  description: "",
};

const MEDALS = ["text-summit-cream", "text-summit-smoke", "text-summit-cerise"];

export default function PitchathonPage() {
  const { data: tracks = [] } = useTracks();
  const { data: entries, isLoading, error } = usePitchEntries();
  const create = useCreatePitchEntry();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [trackFilter, setTrackFilter] = useState<Track | "">("");

  const ranked = useMemo(() => {
    const list = [...(entries ?? [])].sort((a, b) => b.voteCount - a.voteCount);
    return trackFilter ? list.filter((e) => e.track === trackFilter) : list;
  }, [entries, trackFilter]);

  const totalVotes = (entries ?? []).reduce((sum, e) => sum + e.voteCount, 0);
  const topVotes = Math.max(1, ...ranked.map((e) => e.voteCount));

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync(form);
    setForm(EMPTY);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
            Pitchathon
          </h1>
          <p className="mt-1 text-sm text-summit-smoke">
            {(entries ?? []).length} entries · {totalVotes.toLocaleString()} votes cast · updates live
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" /> New entry
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="glass-card flex flex-col gap-3 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              className={inputCls}
              placeholder="Innovator / team name"
              required
              maxLength={255}
              value={form.innovatorName}
              onChange={(e) => set("innovatorName", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Country"
              required
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
            />
            <Select value={form.track} onValueChange={(val) => set("track", val as Track)}>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <textarea
            className={inputCls}
            placeholder="Pitch description"
            required
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          {create.error && <p className="text-sm text-summit-cream">{(create.error as Error).message}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {create.isPending ? "Adding…" : "Add entry"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-[20px] px-4 py-2 text-sm text-summit-smoke hover:text-summit-lilac"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTrackFilter("")}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-colors",
            trackFilter === ""
              ? "bg-summit-cerulean text-summit-violet"
              : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
          )}
        >
          all tracks
        </button>
        {tracks.map(({ value: t }) => (
          <button
            key={t}
            onClick={() => setTrackFilter(t)}
            className={cn(
              "rounded-full px-3 py-1 text-xs transition-colors",
              trackFilter === t
                ? "bg-summit-cerulean text-summit-violet"
                : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-summit-smoke">Loading entries…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load pitch entries — {(error as Error).message}
        </div>
      )}
      {!isLoading && !error && ranked.length === 0 && (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          No entries{trackFilter ? ` in “${trackFilter}”` : ""} yet — add the first above.
        </div>
      )}

      <section className="flex flex-col gap-3">
        {ranked.map((entry, i) => (
          <article key={entry.id} className="glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="flex w-8 shrink-0 items-center justify-center">
                {i < 3 ? (
                  <Trophy className={cn("size-5", MEDALS[i])} />
                ) : (
                  <span className="text-sm text-summit-smoke">{i + 1}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h2 className="truncate font-[family-name:var(--font-archivo)] text-base font-bold">
                    {entry.innovatorName}
                  </h2>
                  <span className="text-xs text-summit-smoke">{entry.country}</span>
                  <span className="rounded-full bg-summit-cerulean/15 px-2 py-0.5 text-[11px] text-summit-cerulean uppercase">
                    {entry.track}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-summit-smoke">{entry.description}</p>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div
                    style={{ width: `${(entry.voteCount / topVotes) * 100}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-summit-cerise to-summit-cerulean transition-[width] duration-500"
                  />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-[family-name:var(--font-archivo)] text-2xl font-bold text-summit-cerise">
                  {entry.voteCount.toLocaleString()}
                </p>
                <p className="text-[11px] text-summit-smoke uppercase">votes</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
