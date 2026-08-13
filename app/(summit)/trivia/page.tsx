"use client";

import { useState } from "react";
import { BarChart3, Plus, Radio, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRIVIA_OPTIONS,
  useCloseTrivia,
  useCreateTrivia,
  usePushTriviaLive,
  useTriviaQuestions,
  useTriviaStats,
  type TriviaOption,
  type TriviaStatus,
} from "@/lib/summit/trivia";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";

const STATUS_STYLES: Record<TriviaStatus, string> = {
  draft: "bg-summit-lilac/10 text-summit-smoke",
  live: "bg-summit-cerise text-white",
  closed: "bg-summit-green/15 text-summit-green",
};

const EMPTY_FORM = {
  text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A" as TriviaOption,
  explanation: "",
};

export default function TriviaPage() {
  const { data: questions, isLoading, error } = useTriviaQuestions();
  const create = useCreateTrivia();
  const pushLive = usePushTriviaLive();
  const close = useCloseTrivia();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [statsFor, setStatsFor] = useState<string | null>(null);
  const { data: stats } = useTriviaStats(statsFor);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync({
      ...form,
      explanation: form.explanation || undefined,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
            Trivia
          </h1>
          <p className="mt-1 text-sm text-summit-smoke">
            One question live at a time — pushing a new one closes the current.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" /> New question
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="glass-card flex flex-col gap-3 p-5">
          <textarea className={inputCls} placeholder="Question text" required rows={2}
            value={form.text} onChange={(e) => set("text", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            {TRIVIA_OPTIONS.map((o) => (
              <input key={o} className={inputCls} placeholder={`Option ${o}`} required maxLength={500}
                value={form[`option${o}` as keyof typeof form]}
                onChange={(e) => set(`option${o}`, e.target.value)} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className={inputCls} value={form.correctOption}
              onChange={(e) => set("correctOption", e.target.value)}>
              {TRIVIA_OPTIONS.map((o) => (
                <option key={o} value={o}>Correct answer: {o}</option>
              ))}
            </select>
            <input className={inputCls} placeholder="Explanation (optional)"
              value={form.explanation} onChange={(e) => set("explanation", e.target.value)} />
          </div>
          {create.error && <p className="text-sm text-summit-cream">{(create.error as Error).message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={create.isPending}
              className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white disabled:opacity-50">
              {create.isPending ? "Saving…" : "Save draft"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-[20px] px-4 py-2 text-sm text-summit-smoke hover:text-summit-lilac">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-summit-smoke">Loading questions…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load trivia — {(error as Error).message}
        </div>
      )}
      {!isLoading && !error && (questions ?? []).length === 0 && (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          No questions yet — draft the first one above.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {(questions ?? []).map((q) => (
          <li key={q.id} className="glass-card p-5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{q.text}</p>
                <p className="mt-1 text-xs text-summit-smoke">
                  A. {q.optionA} · B. {q.optionB} · C. {q.optionC} · D. {q.optionD}
                  <span className="text-summit-green"> · correct: {q.correctOption}</span>
                </p>
              </div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] uppercase", STATUS_STYLES[q.status])}>
                {q.status}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              {q.status !== "live" && (
                <button
                  onClick={() => pushLive.mutate(q.id)}
                  disabled={pushLive.isPending}
                  className="flex items-center gap-1.5 rounded-[20px] bg-summit-cerise px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  <Radio className="size-3.5" /> Push live
                </button>
              )}
              {q.status === "live" && (
                <button
                  onClick={() => close.mutate(q.id)}
                  disabled={close.isPending}
                  className="flex items-center gap-1.5 rounded-[20px] bg-summit-cream px-3 py-1.5 text-xs text-summit-violet disabled:opacity-50"
                >
                  <Square className="size-3.5" /> Close question
                </button>
              )}
              {q.status !== "draft" && (
                <button
                  onClick={() => setStatsFor(statsFor === q.id ? null : q.id)}
                  className="flex items-center gap-1.5 rounded-[20px] bg-summit-lilac/10 px-3 py-1.5 text-xs text-summit-smoke hover:text-summit-lilac"
                >
                  <BarChart3 className="size-3.5" /> {statsFor === q.id ? "Hide stats" : "Stats"}
                </button>
              )}
            </div>

            {statsFor === q.id && stats && (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs text-summit-smoke">{stats.playCount} answers</p>
                {TRIVIA_OPTIONS.map((o) => {
                  const count = stats.distribution[o] ?? 0;
                  const pct = stats.playCount ? (count / stats.playCount) * 100 : 0;
                  return (
                    <div key={o} className="flex items-center gap-2">
                      <span className={cn(
                        "w-4 text-xs",
                        o === q.correctOption ? "text-summit-green" : "text-summit-smoke",
                      )}>
                        {o}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-white/10">
                        <div
                          style={{ width: `${pct}%` }}
                          className={cn(
                            "h-full rounded-full",
                            o === q.correctOption ? "bg-summit-green" : "bg-summit-cerulean",
                          )}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-summit-smoke">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
