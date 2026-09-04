"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useTracks,
  useCreateSession,
  useSessions,
  useUpdateSession,
  type Session,
  type Track,
} from "@/lib/summit/sessions";
import { useSpeakers, useCreateSpeaker } from "@/lib/summit/speakers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtSummitDate, fmtSummitTime, fromSummitInput, summitDateKey, toSummitInput } from "@/lib/summit/time";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";


  export function SessionForm({session, onClose}: {session: Session | null, onClose: () => void, }){
    const { data: tracks = [] } = useTracks();
    const create = useCreateSession();
    const update = useUpdateSession();
    const pending = create.isPending || update.isPending;
    const err = create.error || update.error;
    const [form, setForm] = useState({
        title: session?.title ?? "",
    description: session?.description ?? "",
    day: session?.day ?? 1,
    // Abuja wall-clock, not a slice of the UTC string: slicing put UTC hours
    // in the box, and saving them back as local time lost an hour per edit.
    startsAt: session?.startsAt ? toSummitInput(session.startsAt) : "",
    endsAt: session?.endsAt ? toSummitInput(session.endsAt) : "",
    room: session?.room ?? "",
    track: (session?.track ?? "") as Track,
    type: session?.type ?? "Breakout Session",
    audience: session?.audience ?? "",
    });
  const { data: sessions } = useSessions();
  const { data: speakers } = useSpeakers();

  /**
   * What date each day number actually maps to, read off the agenda instead
   * of a hardcoded string, so a label can never contradict the data. `day`
   * is only a bucket the API caps at 1..2; nothing makes it agree with
   * startsAt, which is why the label has to follow the real date.
   */
  const dayDates = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of sessions ?? []) {
      const seen = m.get(s.day);
      if (!seen || s.startsAt < seen) m.set(s.day, s.startsAt);
    }
    return m;
  }, [sessions]);

  const dayLabel = (d: number) => {
    // The day being edited reads from the form, so picking today shows today
    // rather than being contradicted by the label.
    const iso = d === Number(form.day) && form.startsAt ? fromSummitInput(form.startsAt) : dayDates.get(d);
    if (!iso) return `Day ${d}`;
    return `Day ${d} · ${fmtSummitDate(iso)}`;
  };

  /**
   * The reverse lookup: which day number a calendar date already belongs to.
   * Abuja date, not the UTC slice of the ISO string, so an early-morning
   * session does not land on the day before.
   */
  const dayByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sessions ?? []) m.set(summitDateKey(s.startsAt), s.day);
    return m;
  }, [sessions]);

  // `day` was a free choice next to `startsAt`, so the two could disagree — a
  // 9 Sept session filed under Day 1 breaks the mobile agenda tabs and every
  // day-scoped query. Once the agenda knows which date is which day, the date
  // decides and the dropdown is only there to bootstrap a day nothing sits on.
  const derivedDay = form.startsAt ? dayByDate.get(form.startsAt.slice(0, 10)) : undefined;
  useEffect(() => {
    if (derivedDay && derivedDay !== Number(form.day)) {
      setForm((f) => ({ ...f, day: derivedDay }));
    }
  }, [derivedDay, form.day]);

  // Filled after moun//t rather than in useState: the server renders in UTC and
  // the operator's laptop does not, so a date computed during SSR would
  // hydrate mismatched. New sessions default to the current hour, which is
  // also what you want when adding a session on the day.
  // The track list is server-owned, so the first option is only known once it
  // arrives. Without this a new session would submit an empty track and 400.
  useEffect(() => {
    if (form.track || tracks.length === 0) return;
    setForm((f) => (f.track ? f : { ...f, track: tracks[0].value }));
  }, [tracks, form.track]);

  useEffect(() => {
    if (session) return;
    setForm((f) => {
      if (f.startsAt) return f;
      const start = new Date();
      start.setMinutes(0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      return { ...f, startsAt: toSummitInput(start), endsAt: toSummitInput(end) };
    });
  }, [session]);
  const createSpeaker = useCreateSpeaker();
  const [speakerIds, setSpeakerIds] = useState<string[]>(session?.speakers?.map((s) => s.id) ?? []);
  const [speakerFilter, setSpeakerFilter] = useState("");
  const [newSpeaker, setNewSpeaker] = useState({ name: "", role: "", organisation: "" });
  const [addingSpeaker, setAddingSpeaker] = useState(false);

  const visibleSpeakers = (speakers ?? []).filter((s) =>
    `${s.name} ${s.organisation ?? ""}`.toLowerCase().includes(speakerFilter.toLowerCase()),
  );

  function toggleSpeaker(id: string) {
    setSpeakerIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  async function addSpeaker() {
    if (!newSpeaker.name.trim()) return;
    const created = await createSpeaker.mutateAsync({
      name: newSpeaker.name,
      ...(newSpeaker.role ? { role: newSpeaker.role } : {}),
      ...(newSpeaker.organisation ? { organisation: newSpeaker.organisation } : {}),
    });
    setSpeakerIds((ids) => [...ids, created.id]); // auto-select what you just created
    setNewSpeaker({ name: "", role: "", organisation: "" });
    setAddingSpeaker(false);
  }

    const set = (k: string, v: string | number) => setForm((f) => ({...f, [k] : v}));

    /**
     * Moving the start keeps the session's length: the end comes along by
     * the same amount. A delay is entered once, on the start, and the end
     * stays editable afterwards for a session that is also being shortened.
     */
    const setStart = (v: string) =>
      setForm((f) => {
        if (!f.startsAt || !f.endsAt || !v) return { ...f, startsAt: v };
        const shift = Date.parse(fromSummitInput(v)) - Date.parse(fromSummitInput(f.startsAt));
        const end = Date.parse(fromSummitInput(f.endsAt)) + shift;
        return { ...f, startsAt: v, endsAt: toSummitInput(new Date(end)) };
      });

    /**
     * One room holds one session at a time. This previews what the API's
     * room clearing will do with the times in the form: every later session
     * in the same room and day that the edit would land on is pushed just
     * far enough to start when the one before it ends, and the push
     * cascades. Sessions the edit does not reach stay where they are. Shown
     * from the loaded agenda so the operator sees the exact new times before
     * saving; the API applies the same rule and refuses a collision when the
     * box is unticked.
     */
    const [shiftFollowing, setShiftFollowing] = useState(true);
    const ripple = useMemo(() => {
      if (!session || !form.startsAt || !form.endsAt || !form.room) return null;
      const start = Date.parse(fromSummitInput(form.startsAt));
      const end = Date.parse(fromSummitInput(form.endsAt));
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      const roomKey = form.room.trim().toLowerCase();
      const inRoom = (sessions ?? []).filter(
        (s) =>
          s.id !== session.id &&
          s.day === Number(form.day) &&
          s.status !== "completed" &&
          s.room.trim().toLowerCase() === roomKey,
      );
      const clashBefore =
        inRoom.find((s) => Date.parse(s.startsAt) < start && Date.parse(s.endsAt) > start) ?? null;
      const pushed: { session: Session; startsAt: string; endsAt: string }[] = [];
      let prevEnd = end;
      for (const s of inRoom
        .filter((o) => Date.parse(o.startsAt) >= start)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
        let st = Date.parse(s.startsAt);
        let en = Date.parse(s.endsAt);
        if (st < prevEnd) {
          const delta = prevEnd - st;
          st += delta;
          en += delta;
          pushed.push({ session: s, startsAt: new Date(st).toISOString(), endsAt: new Date(en).toISOString() });
        }
        prevEnd = en;
      }
      return { pushed, clashBefore };
    }, [session, form.startsAt, form.endsAt, form.room, form.day, sessions]);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const payload = {
            ...form,
            day: Number(form.day),
            // Stamp the summit offset rather than letting the browser guess
            // the zone of an offset-less string.
            startsAt: fromSummitInput(form.startsAt),
            endsAt: fromSummitInput(form.endsAt),
            status: session?.status ?? ("scheduled" as const),
            speakerIds,
        };
        if(session){
            await update.mutateAsync({
              id: session.id,
              ...payload,
              // the API pushes by default; false is the explicit opt-out
              shiftFollowing,
            });
        } else {

            await create.mutateAsync(payload);

        }
        onClose();
    };

      return (
    <form onSubmit={submit} className="glass-card flex flex-col gap-3 p-5">
      <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
        {session ? "Edit session" : "New session"}
      </h2>
      <input className={inputCls} placeholder="Title" required value={form.title} onChange={(e) => set("title", e.target.value)} />
      <textarea className={inputCls} placeholder="Description" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Select
          value={form.day.toString()}
          disabled={derivedDay !== undefined}
          onValueChange={(val) => set("day", Number(val))}
        >
          <SelectTrigger className={inputCls}>
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2].map((d) => (
              <SelectItem key={d} value={d.toString()}>{dayLabel(d)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input className={inputCls} type="datetime-local" required value={form.startsAt} onChange={(e) => setStart(e.target.value)} />
        <input className={inputCls} type="datetime-local" required value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
        <input className={inputCls} placeholder="Room" required value={form.room} onChange={(e) => set("room", e.target.value)} />
        <Select value={form.track} onValueChange={(val) => set("track", val)}>
          <SelectTrigger className={inputCls}>
            <SelectValue placeholder="Track" />
          </SelectTrigger>
          <SelectContent>
            {tracks.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input className={inputCls} placeholder="Type (e.g. Breakout Session)" required value={form.type} onChange={(e) => set("type", e.target.value)} />
        <input className={inputCls} placeholder="Audience (optional)" value={form.audience} onChange={(e) => set("audience", e.target.value)} />
      </div>
      {ripple?.clashBefore && (
        <p className="rounded-xl border border-summit-cerise/30 bg-summit-cerise/10 px-4 py-3 text-sm text-summit-cream">
          Starts before &ldquo;{ripple.clashBefore.title}&rdquo; ends at {fmtSummitTime(ripple.clashBefore.endsAt)} in {form.room}. Move that session first, or start this one later.
        </p>
      )}
      {ripple && !ripple.clashBefore && ripple.pushed.length > 0 && (
        <label className="flex items-start gap-3 rounded-xl border border-summit-cerulean/25 bg-summit-cerulean/8 px-4 py-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 accent-summit-cerise"
            checked={shiftFollowing}
            onChange={(e) => setShiftFollowing(e.target.checked)}
          />
          <span className="flex flex-col gap-1">
            <span className="text-summit-lilac">
              {`This lands on ${ripple.pushed.length} session${ripple.pushed.length === 1 ? "" : "s"} in ${form.room}. Push ${ripple.pushed.length === 1 ? "it" : "them"} out of the way:`}
            </span>
            <span className="flex flex-col text-xs text-summit-smoke">
              {ripple.pushed.slice(0, 4).map((p) => (
                <span key={p.session.id}>
                  {p.session.title} · {fmtSummitTime(p.session.startsAt)}–{fmtSummitTime(p.session.endsAt)} → {fmtSummitTime(p.startsAt)}–{fmtSummitTime(p.endsAt)}
                </span>
              ))}
              {ripple.pushed.length > 4 ? <span>+{ripple.pushed.length - 4} more</span> : null}
            </span>
            {!shiftFollowing && (
              <span className="text-xs text-summit-cream">Unticked, the save will be refused while they overlap.</span>
            )}
          </span>
        </label>
      )}
      {err && <p className="text-sm text-summit-cream">{(err as Error).message}</p>}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] tracking-[0.1em] text-summit-smoke uppercase">
            Speakers ({speakerIds.length})
          </p>
          <button
            type="button"
            onClick={() => setAddingSpeaker((v) => !v)}
            className="text-xs text-summit-cerulean hover:underline"
          >
            {addingSpeaker ? "Cancel" : "+ New speaker"}
          </button>
        </div>

        {addingSpeaker && (
          <div className="flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Name"
              value={newSpeaker.name}
              onChange={(e) => setNewSpeaker((s) => ({ ...s, name: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="Role"
              value={newSpeaker.role}
              onChange={(e) => setNewSpeaker((s) => ({ ...s, role: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="Organisation"
              value={newSpeaker.organisation}
              onChange={(e) => setNewSpeaker((s) => ({ ...s, organisation: e.target.value }))}
            />
            <button
              type="button"
              onClick={addSpeaker}
              disabled={createSpeaker.isPending}
              className="rounded-[20px] bg-summit-cerulean px-3 py-1.5 text-xs text-summit-violet disabled:opacity-50"
            >
              {createSpeaker.isPending ? "Saving…" : "Add"}
            </button>
          </div>
        )}

        <input
          className={inputCls}
          placeholder="Filter speakers…"
          value={speakerFilter}
          onChange={(e) => setSpeakerFilter(e.target.value)}
        />

        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-summit-lilac/10 p-2">
          {visibleSpeakers.length === 0 && (
            <p className="p-1 text-xs text-summit-smoke">No speakers yet — add one above.</p>
          )}
          {visibleSpeakers.map((s) => {
            const on = speakerIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSpeaker(s.id)}
                className={
                  "rounded-full px-3 py-1 text-xs transition-colors " +
                  (on
                    ? "bg-summit-cerise text-white"
                    : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac")
                }
              >
                {s.name}
                {s.organisation ? ` · ${s.organisation}` : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onClose} className="rounded-[20px] px-4 py-2 text-sm text-summit-smoke hover:text-summit-lilac">
          Cancel
        </button>
      </div>
    </form>
  );
  }