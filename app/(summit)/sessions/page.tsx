"use client";

import { useState, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { read, utils } from "xlsx";
import { cn } from "@/lib/utils";
import {
  SESSION_STATUSES,
  useSessions,
  useUpdateSessionStatus,
  type Session,
  type SessionStatus,
} from "@/lib/summit/sessions";
import { normaliseAgenda, type AgendaImport } from "@/lib/summit/agenda-import";
import { speakerKey } from "@/lib/summit/agenda-speakers";
import { useApplyAgenda } from "@/lib/summit/agenda-apply";
import { useSpeakers } from "@/lib/summit/speakers";
import { SessionForm } from "@/app/(summit)/_components/SessionForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_STYLES: Record<SessionStatus, string> = {
  scheduled: "bg-summit-lilac/10 text-summit-smoke",
  live: "bg-summit-cerise text-white",
  completed: "bg-summit-green/15 text-summit-green",
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function SessionsPage(){
    const {data: sessions, isLoading, error} = useSessions();
    const { data: knownSpeakers } = useSpeakers();
    const updateStatus = useUpdateSessionStatus();
    const apply = useApplyAgenda();
    const [editing, setEditing] = useState<Session | null>(null);
    const [creating, setCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    /** Parsed workbook awaiting confirmation. Nothing is posted from the file
     *  picker itself: `/sessions/bulk` has no transaction, so a batch that
     *  fails halfway leaves the rows before the failure committed and a retry
     *  duplicates them. The operator sees the whole thing first. */
    const [staged, setStaged] = useState<(AgendaImport & { fileName: string }) | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    /** Roster entries ticked for creation. The parser is a heuristic over free
     *  text, so the operator gets the final say on who becomes a speaker
     *  record rather than discovering the mistakes in the delegate app. */
    const [chosen, setChosen] = useState<Set<string>>(new Set());
    const [showRoster, setShowRoster] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // so re-picking the same file after a fix still fires
      if (!file) return;

      setParseError(null);
      setStaged(null);
      try {
        const workbook = read(await file.arrayBuffer(), { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // `raw: false` returns each cell as its *formatted* text. Without it a
        // date arrives as an Excel serial (46273) and a time as a fraction of a
        // day (0.3923) — which is how "day must not be greater than 2" and
        // "endsAt must be a valid ISO 8601 date string" happened.
        const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, {
          raw: false,
          defval: "",
        });
        if (rows.length === 0) throw new Error("the first sheet has no rows");
        const parsed = normaliseAgenda(rows);
        setStaged({ ...parsed, fileName: file.name });
        // Everyone the parser is confident about starts ticked; the operator
        // unticks rather than hunts.
        setChosen(new Set(parsed.roster.map((p) => speakerKey(p.name))));
        setShowRoster(false);
        apply.reset();
      } catch (err) {
        setParseError((err as Error).message);
      }
    };

    const confirmImport = async () => {
      if (!staged || staged.errors.length > 0) return;
      await apply.mutateAsync({
        rows: staged.rows,
        existing: sessions ?? [],
        knownSpeakers: knownSpeakers ?? [],
        selected: chosen,
      });
      setStaged(null);
    };

    const toggleSpeaker = (key: string) =>
      setChosen((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });

    /** How many rows are already in the database, so the button can say
     *  whether this run will create sessions or only attach speakers. */
    const existingKeys = new Set(
      (sessions ?? []).map((s) => `${s.title.trim().toLowerCase()}|${Date.parse(s.startsAt)}`),
    );
    const newRows = staged
      ? staged.rows.filter(
          (r) =>
            !existingKeys.has(
              `${r.session.title.trim().toLowerCase()}|${Date.parse(r.session.startsAt)}`,
            ),
        ).length
      : 0;

    const days =[...new Set((sessions ?? []).map((s) => s.day))].sort();

    return (
<div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
            Sessions
          </h1>
          <p className="mt-1 text-sm text-summit-smoke">
            Agenda control — status changes go live to delegates instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={apply.isPending}
            className="flex items-center gap-2 rounded-[20px] bg-summit-violet px-4 py-2 text-sm text-summit-lilac transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Upload className="size-4" /> {apply.isPending ? "Importing…" : "Import agenda"}
          </button>
          <button
            onClick={() => { setEditing(null); setCreating(true); }}
            className="flex items-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" /> New session
          </button>
        </div>
      </header>

      {parseError && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t read that file — {parseError}
        </div>
      )}

      {staged && (
        <section className="glass-card flex flex-col gap-3 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
              {staged.fileName}
            </h2>
            <p className="text-xs text-summit-smoke">
              {staged.sessions.length} ready
              {staged.errors.length > 0 && ` · ${staged.errors.length} to fix`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {staged.days.map((d) => (
              <span
                key={d.day}
                className="rounded-full bg-summit-lilac/10 px-3 py-1 text-xs text-summit-smoke"
              >
                Day {d.day} · {new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                })} · {d.count} sessions
              </span>
            ))}
          </div>

          {staged.errors.length > 0 && (
            <div className="flex flex-col gap-1 rounded-xl border border-summit-cerise/30 bg-summit-cerise/5 p-3">
              <p className="text-xs tracking-[0.1em] text-summit-cerise uppercase">
                Fix these rows in the workbook, then upload again
              </p>
              <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                {staged.errors.map((e) => (
                  <li key={e.row} className="text-xs text-summit-cream">
                    <span className="text-summit-smoke">Row {e.row}</span> · {e.title} — {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {staged.warnings.length > 0 && (
            <details className="rounded-xl border border-summit-cerulean/25 bg-summit-cerulean/5 p-3">
              <summary className="cursor-pointer text-xs tracking-[0.1em] text-summit-cerulean uppercase">
                {staged.warnings.length} things to check — the API accepts these, a human
                should look
              </summary>
              <ul className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto">
                {staged.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-summit-smoke">
                    <span className="text-summit-cerulean">{w.kind}</span> · {w.message}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {staged.roster.length > 0 && (
            <div className="rounded-xl border border-summit-lilac/15 p-3">
              <button
                type="button"
                onClick={() => setShowRoster((v) => !v)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-xs tracking-[0.1em] text-summit-smoke uppercase">
                  Speakers · {chosen.size} of {staged.roster.length} selected
                </span>
                <span className="text-xs text-summit-cerulean">
                  {showRoster ? "Hide" : "Review"}
                </span>
              </button>

              {showRoster && (
                <>
                  <p className="mt-2 text-xs text-summit-smoke">
                    Read out of the sheet&apos;s free-text speaker column, so this is a
                    best guess. Untick anything that isn&apos;t a person — unticked names
                    are not created and not attached to any session.
                  </p>
                  <div className="mt-2 flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">
                    {staged.roster.map((p) => {
                      const k = speakerKey(p.name);
                      const on = chosen.has(k);
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => toggleSpeaker(k)}
                          title={[p.role, p.organisation].filter(Boolean).join(" · ")}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs transition-colors",
                            on
                              ? "bg-summit-cerise text-white"
                              : "bg-summit-lilac/10 text-summit-smoke line-through hover:text-summit-lilac",
                          )}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {apply.error && (
            <p className="text-sm text-summit-cream">
              Import failed — {(apply.error as Error).message}
            </p>
          )}

          {apply.data && apply.data.failures.length > 0 && (
            <ul className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-xl border border-summit-cerise/30 p-3">
              {apply.data.failures.map((f, i) => (
                <li key={i} className="text-xs text-summit-cream">
                  {f.title} — {f.reason}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={confirmImport}
              disabled={staged.errors.length > 0 || apply.isPending}
              className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {apply.isPending
                ? apply.progress
                  ? `${apply.progress.phase} ${apply.progress.done}/${apply.progress.total}…`
                  : "Importing…"
                : newRows > 0
                  ? `Import ${newRows} new sessions · ${chosen.size} speakers`
                  : `Attach ${chosen.size} speakers to ${staged.rows.length} sessions`}
            </button>
            <button
              onClick={() => setStaged(null)}
              className="rounded-[20px] px-4 py-2 text-sm text-summit-smoke hover:text-summit-lilac"
            >
              Cancel
            </button>
            {staged.errors.length > 0 ? (
              <p className="text-xs text-summit-smoke">
                Nothing is sent while any row is unreadable — a half-finished batch
                can&apos;t be rolled back.
              </p>
            ) : (
              newRows === 0 && (
                <p className="text-xs text-summit-smoke">
                  Every row already exists, so no session is duplicated — only speakers
                  are added.
                </p>
              )
            )}
          </div>
        </section>
      )}

      {(creating || editing) && (
        <SessionForm
          session={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}

      {isLoading && <p className="text-sm text-summit-smoke">Loading agenda…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load sessions — {(error as Error).message}
        </div>
      )}
      {!isLoading && !error && days.length === 0 && (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          No sessions yet — create the first one above.
        </div>
      )}

      {days.map((day) => (
        <section key={day} className="glass-card p-5">
          <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
            Day {day}
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
            {(sessions ?? [])
              .filter((s) => s.day === day)
              .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
              .map((s) => (
                <li key={s.id} className="flex items-center gap-4 py-3">
                  <span className="w-24 shrink-0 text-sm text-summit-smoke">
                    {fmtTime(s.startsAt)}–{fmtTime(s.endsAt)}
                  </span>
                  <button
                    onClick={() => { setCreating(false); setEditing(s); }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-summit-smoke">
                      {s.room} · {s.type}
                      {s.speakers?.length ? ` · ${s.speakers.map((sp) => sp.name).join(", ")}` : ""}
                    </p>
                  </button>
                  <span className="rounded-full bg-summit-cerulean/15 px-2.5 py-0.5 text-[11px] tracking-wide text-summit-cerulean uppercase">
                    {s.track}
                  </span>
                  <Select
                    value={s.status}
                    disabled={updateStatus.isPending}
                    onValueChange={(val) =>
                      updateStatus.mutate({ id: s.id, status: val as SessionStatus })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "h-auto w-[120px] cursor-pointer rounded-full border-0 px-3 py-1 text-xs outline-none",
                        STATUS_STYLES[s.status],
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
    );
}