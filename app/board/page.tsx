"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

/**
 * The venue departures board.
 *
 * Read from the back of a hall, on a TV in the wings. The live session is the
 * one thing everyone needs, so it takes the top third of the screen at a size
 * that carries; the other rooms are listed five at a time underneath and the
 * pages turn on their own, the way an airport board cycles when there are
 * more flights than rows. Thirteen rooms squeezed into thirteen rows was the
 * first version, and nobody could read it from a metre away.
 *
 * Public and unauthenticated. It reads GET /sessions/board through the same
 * proxy the console uses, but deliberately not through lib/summit/api, which
 * bounces every 401 to /signin - a screen with no operator must never be sent
 * to a login page.
 */

type BoardStatus = "scheduled" | "live" | "completed";

interface BoardSpeaker {
  id: string;
  name: string;
  role: string | null;
  organisation: string | null;
}

interface BoardSession {
  id: string;
  title: string;
  day: number;
  startsAt: string;
  endsAt: string;
  room: string;
  track: string;
  type: string;
  status: BoardStatus;
  speakers: BoardSpeaker[];
}

/** One room's state as the board wants to draw it. */
interface RoomLane {
  room: string;
  now: BoardSession | null;
  next: BoardSession | null;
  later: BoardSession | null;
  /** True when `now` is the operator-set live session, not just clock math. */
  isLive: boolean;
}

const POLL_MS = 20_000;
/** Rows per page in the room list, and how long a page stays up. */
const PAGE_SIZE = 4;
const PAGE_MS = 12_000;
/** Beyond this a countdown stops meaning anything; show the start time. */
const FAR_MS = 6 * 3600_000;
const TZ = "Africa/Lagos";

const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const dayTimeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false });
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const clockFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });

const fmtTime = (iso: string) => timeFmt.format(new Date(iso));
const fmtRange = (s: BoardSession) => `${fmtTime(s.startsAt)} – ${fmtTime(s.endsAt)}`;

/** mm:ss, or h:mm:ss once it crosses an hour - a countdown reads best short. */
function fmtRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * How to say "when": a rolling countdown when it is close enough to watch,
 * otherwise the clock time - "Mon 14:15" on the Friday before, "at 14:15"
 * on the day. "103:52:18" told nobody anything.
 */
function whenLabel(iso: string, now: number): { label: string; value: string; rolling: boolean } {
  const ms = +new Date(iso) - now;
  if (ms <= FAR_MS) return { label: "In", value: fmtRemaining(ms), rolling: true };
  const sameDay = dayKeyFmt.format(new Date(iso)) === dayKeyFmt.format(new Date(now));
  return { label: sameDay ? "At" : "", value: sameDay ? fmtTime(iso) : dayTimeFmt.format(new Date(iso)), rolling: false };
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/**
 * Demo data for ?demo=1: a plausible afternoon across nine rooms laid out
 * around the current minute, so the board can be looked at on a day nothing
 * is live - and so the paging has enough rooms to actually page.
 */
function demoSessions(): BoardSession[] {
  const now = Date.now();
  const at = (min: number) => new Date(now + min * 60_000).toISOString();
  const s = (id: string, room: string, title: string, from: number, to: number, status: BoardStatus, speakers: string[]): BoardSession => ({
    id, title, day: 1, startsAt: at(from), endsAt: at(to), room, track: "general", type: "session", status,
    speakers: speakers.map((name, i) => ({ id: `${id}-${i}`, name, role: null, organisation: null })),
  });
  return [
    s("a1", "Main Hall", "Opening Plenary: The Inclusion Dividend", -95, -35, "completed", ["Dr. Osasuyi Dirisu"]),
    s("a2", "Main Hall", "National Dialogue: Advancing Gender Equity in Academic Economics across Nigerian Universities", -25, 20, "live", ["Prof. Chimezie Anyakora", "Ngozi Okonjo-Iweala"]),
    s("a3", "Main Hall", "Keynote: Financing the Care Economy", 35, 80, "scheduled", ["Amina J. Mohammed"]),
    s("a4", "Main Hall", "Closing Remarks and Communiqué", 95, 125, "scheduled", []),
    s("b1", "Hall B", "Health Forum: Maternal Outcomes at the Last Mile", -40, -5, "completed", ["Dr. Amara Okafor"]),
    s("b2", "Hall B", "Digital Inclusion: Data Equity for Women-Led SMEs", 8, 53, "scheduled", ["Tunde Bakare", "Funke Opeke"]),
    s("b3", "Hall B", "GBV Forum: Survivor-Centred Justice", 65, 110, "scheduled", ["Ngozi Eze"]),
    s("c1", "Pre-Function Area", "Innovation Hub Pitchathon: Round Two", -10, 50, "live", ["Twelve finalists"]),
    s("c2", "Pre-Function Area", "Networking Reception", 60, 120, "scheduled", []),
    s("d1", "Boardroom 2", "Press Briefing", 15, 45, "scheduled", ["Communications Team"]),
    s("e1", "Acacia A/B", "Architects of the Future: Redesigning Governance with Women at the Table", 22, 67, "scheduled", ["To be announced"]),
    s("e2", "Acacia A/B", "Malala: Education Ends Child Marriage", 80, 125, "scheduled", []),
    s("f1", "Obecha A/B", "Making Innovation Count for the Last Mile: Lessons from Across Africa", 30, 75, "scheduled", []),
    s("g1", "Ball Room 4", "Innovation in Local Governance Systems for Better Service Delivery", 48, 93, "scheduled", []),
    s("h1", "Executive Lounge", "CEO Roundtable & Partners Dinner (Invite Only)", 240, 360, "scheduled", []),
    s("i1", "Exhibition Foyer", "Exhibition Booths Open / Tour", 5, 35, "scheduled", []),
    s("j1", "Foyer", "Gender Equity Wall Launch", 90, 120, "scheduled", []),
  ];
}

async function fetchBoard(): Promise<BoardSession[]> {
  const res = await fetch("/api/gs26/sessions/board", { cache: "no-store" });
  if (!res.ok) throw new Error(`board ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Lane maths
// ---------------------------------------------------------------------------

/**
 * Which day to show. The day whose sessions bracket the clock wins; before the
 * summit that is the first day, and between days it is whichever comes next.
 */
function pickDay(sessions: BoardSession[], now: number): number | null {
  const days = [...new Set(sessions.map((s) => s.day))].sort((a, b) => a - b);
  if (days.length === 0) return null;
  for (const d of days) {
    const of = sessions.filter((s) => s.day === d);
    const first = Math.min(...of.map((s) => +new Date(s.startsAt)));
    const last = Math.max(...of.map((s) => +new Date(s.endsAt)));
    // a day "owns" the clock from six hours before its first session until
    // its last one ends, so a screen switched on early still shows the right day
    if (now >= first - 6 * 3600_000 && now <= last) return d;
  }
  const upcoming = days.find((d) => sessions.some((s) => s.day === d && +new Date(s.startsAt) > now));
  return upcoming ?? days[days.length - 1];
}

function buildLanes(sessions: BoardSession[], now: number, roomOrder: string[] | null): RoomLane[] {
  const byRoom = new Map<string, BoardSession[]>();
  for (const s of sessions) {
    const list = byRoom.get(s.room) ?? [];
    list.push(s);
    byRoom.set(s.room, list);
  }
  const rooms = roomOrder ? roomOrder.filter((r) => byRoom.has(r)) : [...byRoom.keys()];

  return rooms.map((room) => {
    const list = (byRoom.get(room) ?? []).sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    // Operator-set LIVE beats the clock (FR-01). Failing that, a session the
    // clock says is on, as long as an operator has not already closed it.
    const live = list.find((s) => s.status === "live");
    const byClock = list.find((s) => s.status !== "completed" && +new Date(s.startsAt) <= now && now < +new Date(s.endsAt));
    const current = live ?? byClock ?? null;
    const after = list.filter(
      (s) => s.status === "scheduled" && s.id !== current?.id && +new Date(s.startsAt) >= (current ? +new Date(current.endsAt) - 60_000 : now),
    );
    return { room, now: current, next: after[0] ?? null, later: after[1] ?? null, isLive: Boolean(live) };
  });
}

// ---------------------------------------------------------------------------
// Motion primitives
// ---------------------------------------------------------------------------

const flip = {
  initial: { rotateX: 90, opacity: 0 },
  animate: { rotateX: 0, opacity: 1 },
  exit: { rotateX: -90, opacity: 0 },
  transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const },
};

/** A digit that rolls up when it changes, like a mechanical counter. */
function Rolling({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden ${className ?? ""}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} className="relative inline-block" style={{ width: ch === ":" ? "0.35em" : "0.62em" }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              className="absolute inset-0 flex justify-center tabular-nums"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
          <span className="invisible">{ch}</span>
        </span>
      ))}
    </span>
  );
}

/** A countdown when close, a clock time when far; same slot either way. */
function When({ iso, now, size, accent }: { iso: string; now: number; size: string; accent?: boolean }) {
  const w = whenLabel(iso, now);
  const cls = `font-[family-name:var(--font-archivo)] ${size} font-bold leading-none tabular-nums ${accent ? "text-summit-cerulean" : "text-summit-lilac"}`;
  return (
    <span className="flex items-baseline gap-[0.4vw] whitespace-nowrap">
      {w.label && <span className="text-[0.9vw] uppercase tracking-[0.18em] text-summit-smoke">{w.label}</span>}
      {w.rolling ? <Rolling text={w.value} className={cls} /> : <span className={cls}>{w.value}</span>}
    </span>
  );
}

function LiveDot() {
  return (
    <span className="relative inline-flex h-[0.75em] w-[0.75em]">
      <motion.span
        className="absolute inset-0 rounded-full bg-summit-cerise"
        animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative inline-flex h-full w-full rounded-full bg-summit-cerise" />
    </span>
  );
}

function speakerLine(s: BoardSession): string {
  const names = s.speakers.map((x) => x.name).filter(Boolean);
  if (names.length === 0) return "";
  return names.slice(0, 3).join("  ·  ") + (names.length > 3 ? `  +${names.length - 3}` : "");
}

// ---------------------------------------------------------------------------
// Hero: the live session(s), readable from the back of the hall
// ---------------------------------------------------------------------------

function HeroCard({ lane, now, wide }: { lane: RoomLane; now: number; wide: boolean }) {
  const s = lane.now;
  if (!s) return null;
  const start = +new Date(s.startsAt);
  const end = +new Date(s.endsAt);
  const progress = Math.min(1, Math.max(0, (now - start) / Math.max(1, end - start)));
  const remaining = end - now;
  const overrun = remaining < 0;
  const speakers = speakerLine(s);

  return (
    <motion.article
      key={s.id}
      {...flip}
      className={`glass-card relative flex min-w-0 flex-col justify-center overflow-hidden px-[2.2vw] py-[1.6vw] ${
        lane.isLive
          ? "border-summit-cerise/40 shadow-[0_0_0_1px_rgb(229_37_154/0.2),0_30px_80px_rgb(229_37_154/0.18)]"
          : "border-summit-lilac/15"
      }`}
    >
      <div className="flex items-center gap-[1vw]">
        {lane.isLive ? (
          <span className="inline-flex items-center gap-[0.6vw] rounded-full bg-summit-cerise px-[1.1vw] py-[0.35vw] text-[1.05vw] font-bold uppercase tracking-[0.2em] text-white">
            <LiveDot /> Live now
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-summit-lilac/12 px-[1.1vw] py-[0.35vw] text-[1.05vw] font-bold uppercase tracking-[0.2em] text-summit-lilac/85">
            In progress
          </span>
        )}
        <span className="font-[family-name:var(--font-archivo)] text-[1.5vw] font-bold uppercase tracking-[0.08em] text-summit-lilac">
          {lane.room}
        </span>
        <span className="text-[1.15vw] tabular-nums text-summit-smoke">{fmtRange(s)}</span>
      </div>

      <div className="mt-[0.9vw] flex items-end justify-between gap-[3vw]">
        <div className="min-w-0 flex-1">
          <h2
            className={`line-clamp-2 font-[family-name:var(--font-archivo)] font-bold leading-[1.05] tracking-[-0.025em] ${
              wide ? "text-[3.4vw]" : "text-[2.5vw]"
            }`}
          >
            {s.title}
          </h2>
          {speakers && <p className="mt-[0.6vw] truncate text-[1.35vw] text-summit-smoke">{speakers}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[1vw] uppercase tracking-[0.25em] text-summit-smoke">{overrun ? "Over by" : "Ends in"}</p>
          <Rolling
            text={fmtRemaining(Math.abs(remaining))}
            className={`font-[family-name:var(--font-archivo)] font-bold leading-none tabular-nums ${wide ? "text-[4.2vw]" : "text-[3.2vw]"} ${
              overrun ? "text-summit-cream" : "text-summit-lilac"
            }`}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[0.5vw] bg-summit-lilac/8">
        <motion.div
          className={`h-full ${overrun ? "bg-summit-cream" : "bg-summit-cerise"}`}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>
    </motion.article>
  );
}

/** Nothing live anywhere: the soonest session across the venue takes the hero. */
function UpNextHero({ lane, now }: { lane: RoomLane; now: number }) {
  const s = lane.next;
  if (!s) return null;
  const speakers = speakerLine(s);
  return (
    <motion.article key={s.id} {...flip} className="glass-card relative flex min-w-0 flex-col justify-center overflow-hidden px-[2.2vw] py-[1.6vw]">
      <div className="flex items-center gap-[1vw]">
        <span className="inline-flex items-center rounded-full bg-summit-cerulean px-[1.1vw] py-[0.35vw] text-[1.05vw] font-bold uppercase tracking-[0.2em] text-summit-violet">
          Up next
        </span>
        <span className="font-[family-name:var(--font-archivo)] text-[1.5vw] font-bold uppercase tracking-[0.08em]">{lane.room}</span>
        <span className="text-[1.15vw] tabular-nums text-summit-smoke">{fmtRange(s)}</span>
      </div>
      <div className="mt-[0.9vw] flex items-end justify-between gap-[3vw]">
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 font-[family-name:var(--font-archivo)] text-[3.4vw] font-bold leading-[1.05] tracking-[-0.025em]">{s.title}</h2>
          {speakers && <p className="mt-[0.6vw] truncate text-[1.35vw] text-summit-smoke">{speakers}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[1vw] uppercase tracking-[0.25em] text-summit-smoke">Starts</p>
          <When iso={s.startsAt} now={now} size="text-[4.2vw]" accent />
        </div>
      </div>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// The room list, five rows a page
// ---------------------------------------------------------------------------

function Row({ lane, now }: { lane: RoomLane; now: number }) {
  const next = lane.now && !lane.isLive ? lane.now : lane.next;
  const then = lane.now && !lane.isLive ? lane.next : lane.later;
  const inProgress = Boolean(lane.now && !lane.isLive);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="glass-card grid min-h-0 flex-1 grid-cols-[15vw_1fr_0.75fr] items-center gap-[2vw] overflow-hidden px-[1.6vw] py-[0.6vw]"
    >
      <p className="truncate font-[family-name:var(--font-archivo)] text-[1.6vw] font-bold leading-[1.05] tracking-[-0.02em]">{lane.room}</p>

      <div className="min-w-0">
        {next ? (
          <>
            <div className="flex items-center gap-[0.7vw]">
              <span
                className={`rounded-full px-[0.8vw] py-[0.2vw] text-[0.85vw] font-semibold uppercase tracking-[0.18em] ${
                  inProgress ? "bg-summit-lilac/12 text-summit-lilac/85" : "bg-summit-cerulean/15 text-summit-cerulean"
                }`}
              >
                {inProgress ? "In progress" : "Next"}
              </span>
              <span className="text-[1vw] tabular-nums text-summit-smoke">{fmtRange(next)}</span>
              <span className="ml-auto pr-[0.4vw]">
                {inProgress ? (
                  <span className="flex items-baseline gap-[0.4vw] whitespace-nowrap">
                    <span className="text-[0.9vw] uppercase tracking-[0.18em] text-summit-smoke">Ends in</span>
                    <Rolling text={fmtRemaining(Math.max(0, +new Date(next.endsAt) - now))} className="font-[family-name:var(--font-archivo)] text-[1.5vw] font-bold leading-none tabular-nums" />
                  </span>
                ) : (
                  <When iso={next.startsAt} now={now} size="text-[1.5vw]" accent={+new Date(next.startsAt) - now <= 10 * 60_000} />
                )}
              </span>
            </div>
            <h3 className="mt-[0.2vw] truncate font-[family-name:var(--font-archivo)] text-[1.45vw] font-bold leading-[1.1] tracking-[-0.015em]">{next.title}</h3>
            {speakerLine(next) && <p className="truncate text-[0.95vw] text-summit-smoke">{speakerLine(next)}</p>}
          </>
        ) : (
          <p className="text-[1vw] uppercase tracking-[0.2em] text-summit-smoke/60">No further sessions</p>
        )}
      </div>

      <div className="min-w-0 border-l border-summit-lilac/10 pl-[1.6vw]">
        {then ? (
          <>
            <p className="text-[0.95vw] tabular-nums text-summit-smoke">
              <span className="mr-[0.6vw] font-semibold uppercase tracking-[0.18em] text-summit-smoke/80">Then</span>
              {fmtTime(then.startsAt)}
            </p>
            <h3 className="mt-[0.15vw] truncate font-[family-name:var(--font-archivo)] text-[1.2vw] font-bold leading-[1.1] text-summit-lilac/75">{then.title}</h3>
          </>
        ) : (
          <p className="text-[1vw] text-summit-smoke/40">—</p>
        )}
      </div>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BoardPage() {
  const [sessions, setSessions] = useState<BoardSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [demo, setDemo] = useState(false);
  const [roomOrder, setRoomOrder] = useState<string[] | null>(null);
  const [dayOverride, setDayOverride] = useState<number | null>(null);
  // when the programme last loaded cleanly; drives the footer's health dot
  const [lastGood, setLastGood] = useState(0);
  // the query string has been read; nothing loads before then, or a demo
  // screen would make one real request before it knew it was a demo
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(0);

  // Read the query string here rather than through useSearchParams, which a
  // static export cannot render without a Suspense boundary above it.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setDemo(q.get("demo") === "1");
    const rooms = q.get("rooms");
    setRoomOrder(rooms ? rooms.split(",").map((r) => r.trim()).filter(Boolean) : null);
    const day = q.get("day");
    setDayOverride(day ? Number(day) : null);
    setReady(true);
  }, []);

  // One clock for the whole board, so every countdown ticks on the same beat.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const load = async () => {
      try {
        const data = demo ? demoSessions() : await fetchBoard();
        if (cancelled) return;
        setSessions(data);
        setError(null);
        setLastGood(Date.now());
      } catch (e) {
        if (cancelled) return;
        // Keep the last good board on screen through a blip. A TV showing a
        // blank error for a dropped packet is worse than one 20 s stale.
        setError(e instanceof Error ? e.message : "offline");
      }
    };
    void load();
    const id = setInterval(load, demo ? 60_000 : POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [demo, ready]);

  const day = useMemo(() => (sessions ? dayOverride ?? pickDay(sessions, now) : null), [sessions, now, dayOverride]);
  const lanes = useMemo(
    () => (sessions && day !== null ? buildLanes(sessions.filter((s) => s.day === day), now, roomOrder) : []),
    [sessions, day, now, roomOrder],
  );

  /**
   * Hero: every operator-set live session (rarely more than two at once).
   * List: everything else with something still to come, soonest first, so
   * page one is always the rooms about to start. Rooms that are done for the
   * day drop off rather than sit there saying "no further sessions".
   */
  const { hero, list, upNext } = useMemo(() => {
    const live = lanes.filter((l) => l.isLive);
    const rest = lanes
      .filter((l) => !l.isLive && (l.now || l.next))
      .sort((a, b) => {
        const ta = +new Date((a.now && !a.isLive ? a.now : a.next)!.startsAt);
        const tb = +new Date((b.now && !b.isLive ? b.now : b.next)!.startsAt);
        return ta - tb;
      });
    if (live.length > 0) return { hero: live.slice(0, 2), list: [...live.slice(2), ...rest], upNext: null as RoomLane | null };
    // nothing live: promote the soonest room with a scheduled session
    const soonest = rest.find((l) => l.next && !l.now) ?? null;
    return { hero: [] as RoomLane[], list: rest.filter((l) => l !== soonest), upNext: soonest };
  }, [lanes]);

  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  useEffect(() => {
    if (pageCount <= 1) {
      setPage(0);
      return;
    }
    const id = setInterval(() => setPage((p) => (p + 1) % pageCount), PAGE_MS);
    return () => clearInterval(id);
  }, [pageCount]);
  const safePage = page % pageCount;
  const rows = list.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  // `now` is the ticking clock state, so this re-evaluates every second
  // without reading the wall clock during render
  const stale = error !== null && now - lastGood > 2 * POLL_MS;

  return (
    <main className="relative flex h-full w-full cursor-none flex-col overflow-hidden px-[3vw] py-[1.8vw]">
      {/* ambient wash: the console's violet with a slow cerise breath in one corner */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-[20vw] -top-[30vw] h-[70vw] w-[70vw] rounded-full bg-summit-cerise/10 blur-[120px]"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-[35vw] -left-[15vw] h-[60vw] w-[60vw] rounded-full bg-summit-cerulean/8 blur-[120px]"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* header */}
      <header className="relative flex items-end justify-between pb-[1vw]">
        <div>
          <p className="text-[0.95vw] uppercase tracking-[0.3em] text-summit-smoke">Gender &amp; Inclusion Summit 2026 · Abuja</p>
          <h1 className="mt-[0.2vw] font-[family-name:var(--font-archivo)] text-[2.4vw] font-bold leading-none tracking-[-0.03em]">
            Venue board
            {day !== null && <span className="ml-[1vw] text-summit-cerise">Day {day}</span>}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[0.95vw] uppercase tracking-[0.3em] text-summit-smoke">{dateFmt.format(new Date(now))}</p>
          <Rolling
            text={clockFmt.format(new Date(now))}
            className="mt-[0.1vw] font-[family-name:var(--font-archivo)] text-[3.2vw] font-bold leading-none tracking-[-0.02em]"
          />
        </div>
      </header>

      {/* hero */}
      <section
        className={`relative grid h-[30vh] shrink-0 gap-[1.2vw] ${hero.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}
        style={{ perspective: "2000px" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {hero.map((lane) => (
            <HeroCard key={lane.room} lane={lane} now={now} wide={hero.length === 1} />
          ))}
          {hero.length === 0 && upNext && <UpNextHero key={`up-${upNext.room}`} lane={upNext} now={now} />}
          {hero.length === 0 && !upNext && sessions !== null && (
            <motion.div key="quiet" {...flip} className="glass-card flex items-center justify-center text-[1.6vw] text-summit-smoke">
              {lanes.length === 0 ? "Nothing scheduled for today." : "No session is live right now."}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* list */}
      <div className="relative mt-[1.1vw] flex items-center justify-between px-[1.2vw] text-[0.85vw] uppercase tracking-[0.25em] text-summit-smoke/70">
        <div className="grid flex-1 grid-cols-[15vw_1fr_0.75fr] gap-[2vw]">
          <span>Room</span>
          <span>Next</span>
          <span>Then</span>
        </div>
        {pageCount > 1 && (
          <span className="flex items-center gap-[0.5vw]" aria-label={`Page ${safePage + 1} of ${pageCount}`}>
            {Array.from({ length: pageCount }, (_, i) => (
              <span
                key={i}
                className={`inline-block h-[0.5vw] rounded-full transition-all duration-500 ${
                  i === safePage ? "w-[1.6vw] bg-summit-cerise" : "w-[0.5vw] bg-summit-lilac/25"
                }`}
              />
            ))}
          </span>
        )}
      </div>
      <section className="relative mt-[0.5vw] flex min-h-0 flex-1 flex-col gap-[0.6vw]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safePage}
            className="flex min-h-0 flex-1 flex-col gap-[0.6vw]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {rows.map((lane) => (
              <Row key={lane.room} lane={lane} now={now} />
            ))}
            {/* keep the grid steady when a page is short, so rows never stretch */}
            {Array.from({ length: PAGE_SIZE - rows.length }, (_, i) => (
              <div key={`pad-${i}`} className="flex-1" />
            ))}
          </motion.div>
        </AnimatePresence>
        {sessions === null && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-[1.4vw] text-summit-smoke">Loading the programme…</div>
        )}
      </section>

      {/* footer */}
      <footer className="relative mt-[0.9vw] flex items-center justify-between border-t border-summit-lilac/10 pt-[0.8vw] text-[0.85vw] uppercase tracking-[0.25em] text-summit-smoke/70">
        <span>All times West Africa Time</span>
        <span className="flex items-center gap-[0.6vw]">
          <span className={`inline-block h-[0.6vw] w-[0.6vw] rounded-full ${stale ? "bg-summit-cream" : "bg-summit-green"}`} />
          {demo ? "Demo programme" : stale ? "Reconnecting to the programme" : "Live programme"}
        </span>
      </footer>
    </main>
  );
}
