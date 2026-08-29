"use client";

import { useState } from "react";
import { BarChart3, Pencil, Plus, Radio, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRIVIA_OPTIONS,
  useCloseTrivia,
  useCreateTrivia,
  useDeleteTrivia,
  usePushTriviaLive,
  useTriviaQuestions,
  useTriviaStats,
  useUpdateTrivia,
  type TriviaOption,
  type TriviaQuestion,
  type TriviaStatus,
} from "@/lib/summit/trivia";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const update = useUpdateTrivia();
  const remove = useDeleteTrivia();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  // null = the form is drafting a new question; an id = editing that one
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [statsFor, setStatsFor] = useState<string | null>(null);
  const { data: stats } = useTriviaStats(statsFor);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function startEdit(q: TriviaQuestion) {
    setForm({
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      explanation: q.explanation ?? "",
    });
    setEditingId(q.id);
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = { ...form, explanation: form.explanation || undefined };
    if (editingId) {
      await update.mutateAsync({ id: editingId, input });
    } else {
      await create.mutateAsync(input);
    }
    closeForm();
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
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
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
            <Select value={form.correctOption} onValueChange={(val) => set("correctOption", val)}>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Correct answer" />
              </SelectTrigger>
              <SelectContent>
                {TRIVIA_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>Correct answer: {o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input className={inputCls} placeholder="Explanation (optional)"
              value={form.explanation} onChange={(e) => set("explanation", e.target.value)} />
          </div>
          {(create.error || update.error) && (
            <p className="text-sm text-summit-cream">
              {((create.error ?? update.error) as Error).message}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={create.isPending || update.isPending}
              className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white disabled:opacity-50">
              {editingId
                ? update.isPending ? "Saving…" : "Save changes"
                : create.isPending ? "Saving…" : "Save draft"}
            </button>
            <button type="button" onClick={closeForm}
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
              <button
                onClick={() => startEdit(q)}
                aria-label={`Edit question: ${q.text}`}
                className="flex items-center gap-1.5 rounded-[20px] px-3 py-1.5 text-xs text-summit-smoke transition-colors hover:bg-summit-lilac/10 hover:text-summit-lilac"
              >
                <Pencil className="size-3.5" /> Edit
              </button>
              {/* Two taps: deleting also deletes every answer given, which
                  removes the question from delegates' history. */}
              <button
                onClick={() => {
                  if (confirmDelete !== q.id) { setConfirmDelete(q.id); return; }
                  remove.mutate(q.id, { onSettled: () => setConfirmDelete(null) });
                }}
                onBlur={() => setConfirmDelete(null)}
                disabled={remove.isPending}
                aria-label={confirmDelete === q.id ? "Confirm delete" : `Delete question: ${q.text}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-[20px] px-3 py-1.5 text-xs transition-colors disabled:opacity-50",
                  confirmDelete === q.id
                    ? "bg-summit-cream text-summit-violet"
                    : "text-summit-smoke hover:bg-summit-lilac/10 hover:text-summit-lilac",
                )}
              >
                <Trash2 className="size-3.5" />
                {confirmDelete === q.id ? "Delete + answers" : "Delete"}
              </button>
            </div>
            {editingId === q.id && (
              <p className="mt-2 text-xs text-summit-cerulean">
                Editing this question in the form above
                {q.status === "live" ? " — it is live, so delegates see changes at once" : ""}.
              </p>
            )}

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
