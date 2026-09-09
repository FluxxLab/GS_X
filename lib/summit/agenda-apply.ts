"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { speakerKey, type ParsedSpeaker } from "./agenda-speakers";
import type { AgendaRow } from "./agenda-import";
import type { Session, SessionInput } from "./sessions";
import type { Speaker } from "./speakers";

/**
 * Applies a parsed agenda to the API.
 *
 * Two things make this more than a bulk POST. Speakers have to exist before a
 * session can reference them, and there is no bulk speaker endpoint — so they
 * are created one at a time, sequentially, because two concurrent POSTs for
 * the same name would create the person twice.
 *
 * And the sessions are usually already there. Re-importing the sheet to attach
 * speakers would duplicate all 88 rows, so each row is matched against what the
 * API already holds and only the difference is written: existing sessions are
 * PATCHed with their speaker list, genuinely new ones are created.
 */

export interface ApplyProgress {
  phase: "speakers" | "attaching" | "creating" | "done";
  done: number;
  total: number;
}

export interface ApplyResult {
  speakersCreated: number;
  speakersReused: number;
  /** Sessions already in the database that a row updated. */
  sessionsAttached: number;
  sessionsCreated: number;
  /** Sessions on the sheet's dates that no row claimed - see planImport. */
  stale: Session[];
  /** Rows whose session could not be matched or written, with the reason. */
  failures: { row: number; title: string; reason: string }[];
}

export interface ApplyInput {
  rows: AgendaRow[];
  /** Sessions the API already holds, from useSessions(). */
  existing: Session[];
  /** Speakers the API already holds, from useSpeakers(). */
  knownSpeakers: Speaker[];
  /** Roster entries the operator chose to create; others are ignored. */
  selected: Set<string>;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Which existing session, if any, each sheet row already is - so that
 * re-importing a revised agenda updates rows in place instead of adding them
 * a second time.
 *
 * `id` is not in the sheet and titles repeat across days ("Tea Break", "The
 * National Anthem"), so a row is identified three ways, tried in order over
 * the whole sheet before the next is attempted:
 *
 *  1. title + start instant - the row is unchanged, or only its speakers or
 *     details changed;
 *  2. day + room + start instant - the same slot under a new title ("Is There
 *     Hope for Creatives" became "Creativity That Pays");
 *  3. day + room + title - the same session moved within its room ("From
 *     Budget Release" went from 4:00 to 3:50).
 *
 * A session can be claimed by one row only, and the passes run in that order,
 * so a room clash in the sheet (two rows, one room, one start) cannot make the
 * second row overwrite the first's session: the first claims it by title, the
 * second finds nothing and is created. Instants are compared as epochs because
 * the API returns UTC and the sheet yields +01:00.
 *
 * `stale` is what the database holds on the sheet's dates that no row claimed:
 * sessions the revised agenda dropped, or duplicates from an earlier import.
 */
export interface ImportPlan {
  /** Per row, the session it updates, or null when it is new. */
  matches: (Session | null)[];
  stale: Session[];
}

export function planImport(rows: AgendaRow[], existing: Session[]): ImportPlan {
  const matches: (Session | null)[] = rows.map(() => null);
  const taken = new Set<string>();
  const claim = (i: number, s: Session | undefined) => {
    if (!s) return;
    matches[i] = s;
    taken.add(s.id);
  };
  const free = (pred: (s: Session) => boolean) => existing.find((s) => !taken.has(s.id) && pred(s));

  const passes: ((r: AgendaRow["session"]) => (s: Session) => boolean)[] = [
    (r) => (s) => norm(s.title) === norm(r.title) && Date.parse(s.startsAt) === Date.parse(r.startsAt),
    (r) => (s) => s.day === r.day && norm(s.room) === norm(r.room) && Date.parse(s.startsAt) === Date.parse(r.startsAt),
    (r) => (s) => s.day === r.day && norm(s.room) === norm(r.room) && norm(s.title) === norm(r.title),
  ];
  for (const pass of passes) {
    rows.forEach((row, i) => {
      if (matches[i] === null) claim(i, free(pass(row.session)));
    });
  }

  const sheetDates = new Set(rows.map((r) => r.session.startsAt.slice(0, 10)));
  const stale = existing.filter((s) => !taken.has(s.id) && sheetDates.has(abujaDate(s.startsAt)));
  return { matches, stale };
}

/** The Abuja calendar date of an instant, to pair with the sheet's dates. */
function abujaDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function useApplyAgenda() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<ApplyProgress | null>(null);

  const mutation = useMutation<ApplyResult, Error, ApplyInput>({
    mutationFn: async ({ rows, existing, knownSpeakers, selected }) => {
      const failures: ApplyResult["failures"] = [];

      // ---- 1. speakers ------------------------------------------------
      const idByName = new Map<string, string>();
      for (const s of knownSpeakers) idByName.set(speakerKey(s.name), s.id);
      const reused = new Set(idByName.keys());

      const toCreate: ParsedSpeaker[] = [];
      const queued = new Set<string>();
      for (const r of rows) {
        for (const p of r.speakers) {
          const k = speakerKey(p.name);
          if (!selected.has(k) || idByName.has(k) || queued.has(k)) continue;
          queued.add(k);
          toCreate.push(p);
        }
      }

      let created = 0;
      setProgress({ phase: "speakers", done: 0, total: toCreate.length });
      for (const p of toCreate) {
        try {
          const made = await api<Speaker>("/speakers", {
            method: "POST",
            body: JSON.stringify({
              name: p.name,
              ...(p.role ? { role: p.role } : {}),
              ...(p.organisation ? { organisation: p.organisation } : {}),
            }),
          });
          idByName.set(speakerKey(p.name), made.id);
          created++;
        } catch (e) {
          failures.push({ row: 0, title: p.name, reason: `speaker: ${(e as Error).message}` });
        }
        setProgress({ phase: "speakers", done: created, total: toCreate.length });
      }

      const idsFor = (people: ParsedSpeaker[]) =>
        people
          .map((p) => idByName.get(speakerKey(p.name)))
          .filter((id): id is string => Boolean(id));

      // ---- 2. split into update vs create ------------------------------
      const plan = planImport(rows, existing);
      const attach: { row: AgendaRow; session: Session }[] = [];
      const create: AgendaRow[] = [];
      rows.forEach((r, i) => {
        const match = plan.matches[i];
        if (match) attach.push({ row: r, session: match });
        else create.push(r);
      });

      // ---- 3. update sessions already in the database ------------------
      // The sheet is the programme of record: whatever differs on a matched
      // row - title, times, room, type, audience, speakers - is written back,
      // so a revised agenda lands as edits rather than as a second copy.
      // Only the fields that differ go in the PATCH, and `track` is left
      // alone because a sheet without a track column would reset it.
      let attached = 0;
      const changes = attach
        .map(({ row, session }) => {
          const next = row.session;
          const patch: Record<string, unknown> = {};
          if (norm(next.title) !== norm(session.title)) patch.title = next.title;
          if ((next.description ?? "") !== (session.description ?? "") && next.description !== next.title)
            patch.description = next.description;
          if (Date.parse(next.startsAt) !== Date.parse(session.startsAt)) patch.startsAt = next.startsAt;
          if (Date.parse(next.endsAt) !== Date.parse(session.endsAt)) patch.endsAt = next.endsAt;
          if (norm(next.room) !== norm(session.room) && next.room !== "TBC") patch.room = next.room;
          if (norm(next.type) !== norm(session.type)) patch.type = next.type;
          if ((next.audience ?? "") !== (session.audience ?? "") && next.audience) patch.audience = next.audience;
          const ids = idsFor(row.speakers);
          if (ids.length > 0) patch.speakerIds = ids;
          return { row, session, patch };
        })
        .filter(({ patch }) => Object.keys(patch).length > 0);
      setProgress({ phase: "attaching", done: 0, total: changes.length });
      for (const { row, session, patch } of changes) {
        try {
          await api<Session>(`/sessions/${session.id}`, {
            method: "PATCH",
            // No ripple during an import: a moved row must not push its
            // neighbours, since the sheet already says where they go. A
            // collision is reported on the row instead.
            body: JSON.stringify({ ...patch, shiftFollowing: false }),
          });
          attached++;
        } catch (e) {
          failures.push({ row: row.row, title: row.session.title, reason: (e as Error).message });
        }
        setProgress({ phase: "attaching", done: attached, total: changes.length });
      }

      // ---- 4. create the rows that are genuinely new ---------------------
      let madeSessions = 0;
      if (create.length > 0) {
        setProgress({ phase: "creating", done: 0, total: create.length });
        const payload: SessionInput[] = create.map((r) => ({
          ...r.session,
          ...(idsFor(r.speakers).length ? { speakerIds: idsFor(r.speakers) } : {}),
        }));
        try {
          const made = await api<Session[]>("/sessions/bulk", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          madeSessions = Array.isArray(made) ? made.length : create.length;
        } catch (e) {
          // /sessions/bulk is a Promise.all with no transaction, so a failure
          // here may still have written some rows. Say so rather than implying
          // nothing happened.
          failures.push({
            row: 0,
            title: `${create.length} new sessions`,
            reason: `${(e as Error).message} — some rows may have been created; check the agenda before retrying`,
          });
        }
        setProgress({ phase: "creating", done: madeSessions, total: create.length });
      }

      setProgress({ phase: "done", done: 1, total: 1 });
      return {
        speakersCreated: created,
        speakersReused: [...queued].filter((k) => reused.has(k)).length,
        sessionsAttached: attached,
        sessionsCreated: madeSessions,
        stale: plan.stale,
        failures,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["speakers"] });
    },
  });

  return { ...mutation, progress };
}
