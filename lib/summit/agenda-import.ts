import type { SessionInput } from "./sessions";

/**
 * Turns the published agenda workbook into `SessionInput`s the API will accept.
 *
 * The sheet and the API disagree in three places, and every one of them
 * produced a 400 on upload:
 *
 *  - its `Day` column holds a *date* (2026-09-08); the API wants a 1..2 bucket
 *  - its start/end columns hold bare clock times ("8:00 AM"); the API wants ISO
 *  - its `track` column mixes five real thematic tracks with eleven programme
 *    buckets, and only the five are in the database enum
 *
 * Everything here is pure, so the mapping is unit-testable without a file and
 * the page can show every bad row *before* posting anything. That matters:
 * `/sessions/bulk` is a `Promise.all` with no transaction, so a batch that
 * fails halfway leaves every row before the failure committed.
 */

/** Lagos is UTC+01:00 all year with no DST, so a fixed offset is exact.
 *  `toISOString()` on a naive local date would instead shift the whole agenda
 *  by whatever timezone the operator's laptop happens to be in. */
const WAT_OFFSET = "+01:00";

/** The five thematic tracks, by the label the agenda uses for each. */
const THEMATIC_TRACKS: Record<string, string> = {
  "inclusive digital transformation": "digital",
  "economic inclusion": "economic",
  gbv: "gbv",
  "gender based violence": "gbv",
  "gender based violence gbv": "gbv",
  "health nutrition": "health",
  "security transportation": "security",
};

/**
 * Agenda labels that are programme buckets rather than tracks. Listed
 * explicitly rather than defaulted, so a label the sheet grows later surfaces
 * as a failed row instead of being silently filed under "General Programme".
 */
const GENERAL_BUCKETS = new Set([
  "awards closing",
  "education",
  "exhibition engagement",
  "general programme",
  "leadership networking",
  "networking breaks",
  "opening ceremony",
  "plenary",
  "registration",
  "research",
  "to be confirmed",
]);

/** Lowercase, drop punctuation, collapse spaces — so "Health & Nutrition",
 *  "Health and Nutrition" and "health  &  nutrition" are one key. */
function key(s: string): string {
  return s
    .toLowerCase()
    .replace(/\band\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Excel's day zero. Serial 1 is 1 Jan 1900, and Excel wrongly believes 1900
 *  was a leap year — the 30 Dec 1899 epoch absorbs the off-by-one. */
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

function fromSerial(serial: number): Date {
  return new Date(EXCEL_EPOCH_UTC + Math.round(serial * 86_400_000));
}

/**
 * A date cell in whatever shape the parser returns: `{ raw: false }` gives the
 * formatted string, the default gives an Excel serial, `{ cellDates: true }`
 * gives a Date. Accepting all three means the import survives someone
 * re-saving the workbook with different cell formatting — which is exactly how
 * the serial number reached `day` and tripped the `@Max(2)`.
 */
function toDateOnly(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") return fromSerial(v).toISOString().slice(0, 10);

  const s = String(v ?? "").trim();

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;

  // dd/mm/yyyy — the sheet is Nigerian, so day-first, never month-first
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (slash) return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;

  if (s !== "" && Number.isFinite(Number(s))) {
    return fromSerial(Number(s)).toISOString().slice(0, 10);
  }
  throw new Error(`"${s}" is not a date`);
}

/** A clock cell to "HH:mm". Excel stores a bare time as a fraction of a day. */
function toClock(v: unknown): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  if (v instanceof Date) return `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`;
  if (typeof v === "number") {
    const mins = Math.round((v % 1) * 1440);
    return `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`;
  }

  const s = String(v ?? "").trim();
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i.exec(s);
  if (m) {
    let h = Number(m[1]);
    // 12:xx AM is 00:xx and 12:xx PM is 12:xx, which a plain +12 gets wrong.
    if (m[3]) h = (h % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0);
    if (h > 23) throw new Error(`"${s}" is not a time`);
    return `${pad(h)}:${m[2]}`;
  }

  if (s !== "" && Number.isFinite(Number(s))) return toClock(Number(s));
  throw new Error(`"${s}" is not a time`);
}

/** Header cells vary in case and spelling between exports ("StartAt",
 *  "startsAt", "Start"), so rows are read through normalised keys rather than
 *  a guessed pair like `row.startsAt || row.StartsAt`, which silently misses. */
function readRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[key(k).replace(/ /g, "")] = v;
  return out;
}

const pick = (r: Record<string, unknown>, ...names: string[]) =>
  names.map((n) => r[n]).find((v) => v !== undefined && String(v).trim() !== "");

const text = (v: unknown) => String(v ?? "").trim();

export interface AgendaRowError {
  /** 1-based spreadsheet row, header included — the number shown in Excel. */
  row: number;
  title: string;
  reason: string;
}

export interface AgendaImport {
  sessions: SessionInput[];
  errors: AgendaRowError[];
  /** Which agenda date became day 1 and day 2, for the confirmation summary. */
  days: { day: number; date: string; count: number }[];
}

export function normaliseAgenda(rows: Record<string, unknown>[]): AgendaImport {
  const parsed = rows.map(readRow);

  /**
   * Day numbers come from the sheet's own dates rather than a hardcoded pair,
   * so the import still works if the summit dates move. More than two distinct
   * dates is a real error, not something to truncate — the API caps `day` at 2.
   */
  const dates = [
    ...new Set(
      parsed
        .map((r) => {
          try {
            return toDateOnly(pick(r, "day", "date"));
          } catch {
            return null; // reported per row below, not here
          }
        })
        .filter((d): d is string => d !== null),
    ),
  ].sort();

  const dayOf = new Map(dates.map((d, i) => [d, i + 1]));

  const sessions: SessionInput[] = [];
  const errors: AgendaRowError[] = [];

  parsed.forEach((r, i) => {
    const rowNo = i + 2; // +1 for the zero index, +1 for the header row
    const title = text(pick(r, "title", "session", "sessiontitle"));

    try {
      if (!title) throw new Error("no title");

      const date = toDateOnly(pick(r, "day", "date"));
      const day = dayOf.get(date);
      if (!day) throw new Error(`"${date}" is not a summit day`);
      if (day > 2) {
        throw new Error(
          `the sheet has ${dates.length} dates (${dates.join(", ")}) — the API accepts two`,
        );
      }

      const start = toClock(pick(r, "startat", "startsat", "start", "starttime"));
      const end = toClock(pick(r, "endsat", "endat", "end", "endtime"));
      const startsAt = `${date}T${start}:00${WAT_OFFSET}`;
      const endsAt = `${date}T${end}:00${WAT_OFFSET}`;
      if (end <= start) throw new Error(`ends (${end}) at or before it starts (${start})`);

      const label = text(pick(r, "track"));
      const k = key(label);
      const track = !label
        ? "general"
        : (THEMATIC_TRACKS[k] ?? (GENERAL_BUCKETS.has(k) ? "general" : null));
      if (!track) throw new Error(`unknown track "${label}"`);

      const description = text(pick(r, "description", "summary"));
      const audience = text(pick(r, "audience"));

      sessions.push({
        title: title.slice(0, 255),
        // The column is NOT NULL, and a blank cell would fail at insert rather
        // than in validation — a 500 mid-batch is far harder to read than a 400.
        description: description || title,
        day,
        startsAt,
        endsAt,
        room: text(pick(r, "room", "venue", "location")) || "TBC",
        track,
        type: text(pick(r, "type", "sessiontype")).slice(0, 255) || "Session",
        ...(audience ? { audience: audience.slice(0, 255) } : {}),
      });
    } catch (e) {
      errors.push({ row: rowNo, title: title || "(untitled)", reason: (e as Error).message });
    }
  });

  const days = dates.slice(0, 2).map((date, i) => ({
    day: i + 1,
    date,
    count: sessions.filter((s) => s.day === i + 1).length,
  }));

  return { sessions, errors, days };
}
