"use client";

import { useState } from "react";
import { Lock, Pencil, Play, Plus, Trash2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracks, type Track } from "@/lib/summit/sessions";
import {
  usePitchTopics,
  useCreatePitchEntry,
  useCreatePitchTopic,
  useDeletePitchEntry,
  useDeletePitchTopic,
  useSetTopicVoting,
  useUpdatePitchEntry,
  share,
  standing,
  type PitchEntry,
  type PitchTopic,
} from "@/lib/summit/voting";
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

const VOTING_LABEL = {
  pending: "not open yet",
  open: "voting open",
  closed: "voting closed",
} as const;

const VOTING_STYLE = {
  pending: "bg-summit-lilac/10 text-summit-smoke",
  open: "bg-summit-cerise/20 text-summit-cerise",
  closed: "bg-summit-cerulean/15 text-summit-cerulean",
} as const;

export default function PitchathonPage() {
  const { data: topics, isLoading, error } = usePitchTopics();
  const createTopic = useCreatePitchTopic();
  const [newTopic, setNewTopic] = useState("");

  const totalBallots = (topics ?? []).reduce((sum, t) => sum + t.voters, 0);
  const totalPitches = (topics ?? []).reduce((sum, t) => sum + t.entries.length, 0);

  async function addTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopic.trim()) return;
    await createTopic.mutateAsync({
      name: newTopic.trim(),
      position: topics?.length ?? 0,
    });
    setNewTopic("");
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Innovation Hub
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          {(topics ?? []).length} topics · {totalPitches} pitches ·{" "}
          {totalBallots.toLocaleString()} ballots cast · updates live
        </p>
        <p className="mt-2 max-w-2xl text-xs text-summit-smoke">
          Each topic is one ballot: a delegate casts a single vote in it and can
          change that vote until you close the topic. Closing freezes the result
          that gets announced and cannot be undone.
        </p>
      </header>

      <form onSubmit={addTopic} className="glass-card flex flex-wrap gap-3 p-5">
        <input
          className={cn(inputCls, "flex-1 min-w-[220px]")}
          placeholder="New topic name — e.g. “Digital Inclusion”"
          maxLength={160}
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <button
          type="submit"
          disabled={createTopic.isPending || !newTopic.trim()}
          className="flex items-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="size-4" />
          {createTopic.isPending ? "Adding…" : "Add topic"}
        </button>
        {createTopic.error && (
          <p className="w-full text-sm text-summit-cream">
            {(createTopic.error as Error).message}
          </p>
        )}
      </form>

      {isLoading && <p className="text-sm text-summit-smoke">Loading topics…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load the pitchathon — {(error as Error).message}
        </div>
      )}
      {!isLoading && !error && (topics ?? []).length === 0 && (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          No topics yet — add the first above, then add its pitches.
        </div>
      )}

      {(topics ?? []).map((topic) => (
        <TopicSection key={topic.id} topic={topic} />
      ))}
    </div>
  );
}

function TopicSection({ topic }: { topic: PitchTopic }) {
  const { data: tracks = [] } = useTracks();
  const create = useCreatePitchEntry();
  const update = useUpdatePitchEntry();
  const remove = useDeletePitchEntry();
  const setVoting = useSetTopicVoting();
  const removeTopic = useDeletePitchTopic();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  // null = the form is adding; an id = the form is editing that entry
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDropTopic, setConfirmDropTopic] = useState(false);

  const ranked = standing(topic);
  const closed = topic.voting === "closed";
  const winner = closed && ranked.length > 0 ? ranked[0] : null;
  // A margin of zero on a closed topic is a tie, and the tie-break is a
  // judges' call - surfaced here so nobody announces a winner from this screen
  // without noticing.
  const tied =
    winner != null && ranked.length > 1 && ranked[1].votes === winner.votes;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function startEdit(entry: PitchEntry) {
    setForm({
      innovatorName: entry.innovatorName,
      country: entry.country,
      track: entry.track,
      description: entry.description,
    });
    setEditingId(entry.id);
    setShowForm(true);
  }

  function closeForm() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await update.mutateAsync({ id: editingId, input: form });
    } else {
      await create.mutateAsync({ ...form, topicId: topic.id });
    }
    closeForm();
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-[family-name:var(--font-archivo)] text-xl font-bold">
            {topic.name}
          </h2>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] uppercase",
              VOTING_STYLE[topic.voting],
            )}
          >
            {VOTING_LABEL[topic.voting]}
          </span>
          <span className="text-xs text-summit-smoke">
            {topic.entries.length} pitches · {topic.voters.toLocaleString()} ballots
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!closed && (
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-summit-smoke transition-colors hover:bg-summit-lilac/10 hover:text-summit-lilac"
            >
              <Plus className="size-3.5" /> Pitch
            </button>
          )}

          {topic.voting === "pending" && (
            <button
              type="button"
              onClick={() => setVoting.mutate({ id: topic.id, action: "open" })}
              disabled={setVoting.isPending || topic.entries.length === 0}
              title={
                topic.entries.length === 0
                  ? "Add pitches before opening the ballot"
                  : undefined
              }
              className="flex items-center gap-1 rounded-[20px] bg-summit-cerise px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Play className="size-3.5" /> Open voting
            </button>
          )}

          {/* Two taps. Closing freezes the announced result and cannot be
              undone, so it gets the same guard as a deletion. */}
          {topic.voting === "open" && (
            <button
              type="button"
              onClick={() => {
                if (!confirmClose) { setConfirmClose(true); return; }
                setVoting.mutate(
                  { id: topic.id, action: "close" },
                  { onSettled: () => setConfirmClose(false) },
                );
              }}
              onBlur={() => setConfirmClose(false)}
              disabled={setVoting.isPending}
              className={cn(
                "flex items-center gap-1 rounded-[20px] px-3 py-1.5 text-xs transition-colors disabled:opacity-50",
                confirmClose
                  ? "bg-summit-cream text-summit-violet"
                  : "bg-summit-lilac/10 text-summit-lilac hover:bg-summit-lilac/20",
              )}
            >
              <Lock className="size-3.5" />
              {confirmClose ? "Confirm — this is final" : "Close voting"}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!confirmDropTopic) { setConfirmDropTopic(true); return; }
              removeTopic.mutate(topic.id, {
                onSettled: () => setConfirmDropTopic(false),
              });
            }}
            onBlur={() => setConfirmDropTopic(false)}
            disabled={removeTopic.isPending}
            aria-label={
              confirmDropTopic
                ? `Confirm removing ${topic.name}, its pitches and its ballots`
                : `Remove topic ${topic.name}`
            }
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors disabled:opacity-50",
              confirmDropTopic
                ? "bg-summit-cream text-summit-violet"
                : "text-summit-smoke hover:bg-summit-lilac/10 hover:text-summit-lilac",
            )}
          >
            <Trash2 className="size-3.5" />
            {confirmDropTopic ? "Delete topic + ballots" : "Delete"}
          </button>
        </div>
      </div>

      {setVoting.error && (
        <p className="text-sm text-summit-cream">{(setVoting.error as Error).message}</p>
      )}

      {closed && winner && (
        <div className="glass-card flex items-center gap-3 p-4">
          <Trophy className="size-5 shrink-0 text-summit-cream" />
          <p className="text-sm">
            {tied ? (
              <>
                <span className="text-summit-cream">Tie</span> — {winner.votes} votes
                each. The tie-break is the judges&apos; call.
              </>
            ) : (
              <>
                <span className="font-bold">{winner.innovatorName}</span> won with{" "}
                {winner.votes.toLocaleString()} of{" "}
                {(topic.result?.voters ?? 0).toLocaleString()} ballots (
                {share(winner.votes, topic.result?.voters ?? 0)}%).
              </>
            )}
          </p>
        </div>
      )}

      {showForm && !closed && (
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
          {(create.error || update.error) && (
            <p className="text-sm text-summit-cream">
              {((create.error ?? update.error) as Error).message}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={create.isPending || update.isPending}
              className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {editingId
                ? update.isPending
                  ? "Saving…"
                  : "Save changes"
                : create.isPending
                  ? "Adding…"
                  : "Add pitch"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-[20px] px-4 py-2 text-sm text-summit-smoke hover:text-summit-lilac"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {ranked.length === 0 ? (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          No pitches in this topic yet — add the first before opening the ballot.
        </div>
      ) : (
        ranked.map((entry, i) => {
          const voters = closed ? (topic.result?.voters ?? 0) : topic.voters;
          const pct = share(entry.votes, voters);
          return (
            <article key={entry.id} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex w-8 shrink-0 items-center justify-center">
                  {closed && i === 0 && !tied ? (
                    <Trophy className="size-5 text-summit-cream" />
                  ) : (
                    <span className="text-sm text-summit-smoke">{i + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="truncate font-[family-name:var(--font-archivo)] text-base font-bold">
                      {entry.innovatorName}
                    </h3>
                    <span className="text-xs text-summit-smoke">{entry.country}</span>
                    <span className="rounded-full bg-summit-cerulean/15 px-2 py-0.5 text-[11px] text-summit-cerulean uppercase">
                      {entry.track}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-summit-smoke">
                    {entry.description}
                  </p>
                  {/* Bar is share of this topic's ballots, not of the leader:
                      the ballots are the fixed denominator, so the bars add up
                      to the turnout instead of always maxing out at 100%. */}
                  <div className="mt-2 h-1.5 rounded-full bg-white/10">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-summit-cerise to-summit-cerulean transition-[width] duration-500"
                    />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="font-[family-name:var(--font-archivo)] text-2xl font-bold text-summit-cerise">
                      {entry.votes.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-summit-smoke uppercase">
                      {pct}% of ballots
                    </p>
                  </div>
                  {!closed && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        aria-label={`Edit ${entry.innovatorName}`}
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-summit-smoke transition-colors hover:bg-summit-lilac/10 hover:text-summit-lilac"
                      >
                        <Pencil className="size-3.5" /> Edit
                      </button>
                      {/* Two taps: the first arms, the second withdraws.
                          Removing a pitch also removes the ballots resting on
                          it, which lets those delegates vote again. */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirmDelete !== entry.id) { setConfirmDelete(entry.id); return; }
                          remove.mutate(entry.id, { onSettled: () => setConfirmDelete(null) });
                        }}
                        onBlur={() => setConfirmDelete(null)}
                        disabled={remove.isPending}
                        aria-label={
                          confirmDelete === entry.id
                            ? `Confirm removing ${entry.innovatorName} and its ${entry.votes} votes`
                            : `Remove ${entry.innovatorName}`
                        }
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors disabled:opacity-50",
                          confirmDelete === entry.id
                            ? "bg-summit-cream text-summit-violet"
                            : "text-summit-smoke hover:bg-summit-lilac/10 hover:text-summit-lilac",
                        )}
                      >
                        <Trash2 className="size-3.5" />
                        {confirmDelete === entry.id
                          ? entry.votes > 0
                            ? `Delete + ${entry.votes} votes`
                            : "Confirm"
                          : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
