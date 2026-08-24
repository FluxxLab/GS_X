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
  sessionsAttached: number;
  sessionsCreated: number;
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

/**
 * Identity for matching a sheet row to a session already in the database.
 * Title plus start instant — `id` is not in the sheet and titles repeat across
 * days ("Tea Break", "The National Anthem"), so neither alone is enough.
 * Compared as an epoch because the API returns UTC and the sheet yields +01:00.
 */
function sessionKey(title: string, startsAt: string): string {
  return `${title.trim().toLowerCase()}|${Date.parse(startsAt)}`;
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

      // ---- 2. split into attach vs create ------------------------------
      const byKey = new Map<string, Session>();
      for (const s of existing) byKey.set(sessionKey(s.title, s.startsAt), s);

      const attach: { row: AgendaRow; session: Session }[] = [];
      const create: AgendaRow[] = [];
      for (const r of rows) {
        const match = byKey.get(sessionKey(r.session.title, r.session.startsAt));
        if (match) attach.push({ row: r, session: match });
        else create.push(r);
      }

      // ---- 3. attach speakers to sessions already in the database -------
      let attached = 0;
      const needsAttach = attach.filter(({ row }) => idsFor(row.speakers).length > 0);
      setProgress({ phase: "attaching", done: 0, total: needsAttach.length });
      for (const { row, session } of needsAttach) {
        try {
          await api<Session>(`/sessions/${session.id}`, {
            method: "PATCH",
            // Only speakerIds: PATCH is partial, and resending the whole row
            // would overwrite any correction made in the UI since the import.
            body: JSON.stringify({ speakerIds: idsFor(row.speakers) }),
          });
          attached++;
        } catch (e) {
          failures.push({ row: row.row, title: row.session.title, reason: (e as Error).message });
        }
        setProgress({ phase: "attaching", done: attached, total: needsAttach.length });
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
