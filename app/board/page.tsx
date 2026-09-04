"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { summitDateKey } from "@/lib/summit/time";
import { dayHomes, dayOfDate } from "@/lib/summit/summit-days";
import { getSocket } from "@/lib/summit/socket";

/**
 * The venue departures board.
 *
 * One row per room, read from a few metres away on a TV in the wings: what is
 * live, how long it has left, what is next and when it starts. The shape is
 * borrowed from an airport board because that is the one screen everyone
 * already knows how to read at a glance, and the motion is borrowed from the
 * same place - a row flips when its session changes, digits roll when they
 * tick, nothing bounces.
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

/**
 * The poll is the floor, not the ceiling. A screen that is logged in also
 * listens on the socket and refetches the moment a session changes; a TV in
 * the wings with no login cannot open the socket, so it polls fast enough
 * that a status change reaches it before anyone looks up.
 */
const POLL_MS = 3_000;
/** How long a blip is tolerated before the board says it is stale. */
const STALE_MS = 30_000;
/**
 * The board is a queue, not a directory: five rooms at a time, the ones with
 * something happening soonest. A room whose session ends with nothing after
 * it leaves the board and the next room moves up. Five is what stays legible
 * from the back of a hall on a 1080p screen.
 */
const MAX_ROWS = 5;
/** Beyond this a countdown stops meaning anything; show the start time. */
const FAR_MS = 6 * 3600_000;
const TZ = "Africa/Lagos";

const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const dayTimeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false });
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const clockFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const shortDateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });

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
 * Demo data for ?demo=1: a plausible afternoon laid out around the current
 * minute, so the board can be looked at and styled on a day nothing is live.
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
    s("a2", "Main Hall", "National Dialogue: Advancing Gender Equity in Academic Economics", -25, 20, "live", ["Prof. Chimezie Anyakora", "Ngozi Okonjo-Iweala"]),
    s("a3", "Main Hall", "Keynote: Financing the Care Economy", 35, 80, "scheduled", ["Amina J. Mohammed"]),
    s("a4", "Main Hall", "Closing Remarks and Communiqué", 95, 125, "scheduled", []),
    s("b1", "Hall B", "Health Forum: Maternal Outcomes at the Last Mile", -40, -5, "completed", ["Dr. Amara Okafor"]),
    s("b2", "Hall B", "Digital Inclusion: Data Equity for Women-Led SMEs", 8, 53, "scheduled", ["Tunde Bakare", "Funke Opeke"]),
    s("b3", "Hall B", "GBV Forum: Survivor-Centred Justice", 65, 110, "scheduled", ["Ngozi Eze"]),
    s("c1", "Pre-Function Area", "Innovation Hub Pitchathon: Round Two", -10, 50, "scheduled", ["Twelve finalists"]),
    s("c2", "Pre-Function Area", "Networking Reception", 60, 120, "scheduled", []),
    s("d1", "Boardroom 2", "Press Briefing", 15, 45, "scheduled", ["Communications Team"]),
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
 * Which date to show, as an Abuja `YYYY-MM-DD` key.
 *
 * By date and not by the `day` bucket: `day` is a free choice on the form,
 * so a 7 Sept test session filed under Day 1 used to land on the same board
 * as the real 8 Sept programme, and the board called all of it "Day 1".
 *
 * An operator-set live session wins outright - whatever is live has to be on
 * the board (FR-01). Failing that, the date whose sessions bracket the clock,
 * from six hours before its first session until its last one ends, so a
 * screen switched on early still shows the right date. Before the summit
 * that is the first date; between dates it is whichever comes next.
 */
function pickDate(sessions: BoardSession[], now: number): string | null {
  const live = sessions.find((s) => s.status === "live");
  if (live) return summitDateKey(live.startsAt);
  const dates = [...new Set(sessions.map((s) => summitDateKey(s.startsAt)))].sort();
  if (dates.length === 0) return null;
  for (const d of dates) {
    const of = sessions.filter((s) => summitDateKey(s.startsAt) === d);
    const first = Math.min(...of.map((s) => +new Date(s.startsAt)));
    const last = Math.max(...of.map((s) => +new Date(s.endsAt)));
    if (now >= first - 6 * 3600_000 && now <= last) return d;
  }
  const upcoming = dates.find((d) => sessions.some((s) => summitDateKey(s.startsAt) === d && +new Date(s.startsAt) > now));
  return upcoming ?? dates[dates.length - 1];
}

function buildLanes(sessions: BoardSession[], now: number, roomOrder: string[] | null): RoomLane[] {
  const byRoom = new Map<string, BoardSession[]>();
  for (const s of sessions) {
    const list = byRoom.get(s.room) ?? [];
    list.push(s);
    byRoom.set(s.room, list);
  }

  const rooms = roomOrder ? roomOrder.filter((r) => byRoom.has(r)) : [...byRoom.keys()].sort((a, b) => a.localeCompare(b));

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

/**
 * The queue order: live rooms first, then whichever room has something on or
 * starting soonest. Rooms with nothing left today drop out entirely rather
 * than sit on the board saying so, which is what frees a row for the next
 * one to move up into.
 */
function queueLanes(lanes: RoomLane[]): RoomLane[] {
  const startOf = (l: RoomLane) => +new Date((l.now ?? l.next)!.startsAt);
  return lanes
    .filter((l) => l.now || l.next)
    .sort((a, b) => {
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      if (Boolean(a.now) !== Boolean(b.now)) return a.now ? -1 : 1;
      return startOf(a) - startOf(b);
    })
    .slice(0, MAX_ROWS);
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
    <span className="flex items-baseline gap-[calc(0.4*var(--u))] whitespace-nowrap">
      {w.label && <span className="text-[calc(0.9*var(--u))] uppercase tracking-[0.18em] text-summit-smoke">{w.label}</span>}
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

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------

function Speakers({ session, muted }: { session: BoardSession; muted?: boolean }) {
  const names = (session.speakers ?? []).map((s) => s.name).filter(Boolean);
  if (names.length === 0) return null;
  return (
    <p className={`truncate text-[calc(1.15*var(--u))] leading-tight ${muted ? "text-summit-smoke/70" : "text-summit-smoke"}`}>
      {names.slice(0, 3).join("  ·  ")}
      {names.length > 3 ? `  +${names.length - 3}` : ""}
    </p>
  );
}

function NowCell({ lane, now }: { lane: RoomLane; now: number }) {
  const s = lane.now;
  if (!s) {
    // Between sessions: show what the wait is for rather than an empty cell.
    const upcoming = lane.next;
    return (
      <motion.div key="idle" {...flip} className="flex h-full flex-col justify-center gap-[calc(0.4*var(--u))]">
        <p className="text-[calc(1.05*var(--u))] uppercase tracking-[0.2em] text-summit-smoke">{upcoming ? "Break" : "No further sessions"}</p>
        {upcoming && <p className="text-[calc(1.5*var(--u))] text-summit-lilac/70">Doors open {fmtTime(upcoming.startsAt)}</p>}
      </motion.div>
    );
  }

  const remaining = +new Date(s.endsAt) - now;
  const overrun = remaining < 0;

  return (
    <motion.div key={s.id} {...flip} className="flex h-full flex-col justify-center gap-[calc(0.45*var(--u))]">
      <div className="flex flex-wrap items-center gap-[calc(0.7*var(--u))]">
        {lane.isLive ? (
          <span className="inline-flex shrink-0 items-center gap-[calc(0.5*var(--u))] whitespace-nowrap rounded-full bg-summit-cerise/15 px-[calc(0.9*var(--u))] py-[calc(0.25*var(--u))] text-[calc(0.95*var(--u))] font-semibold uppercase tracking-[0.18em] text-summit-cerise">
            <LiveDot /> Live
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-summit-lilac/10 px-[calc(0.9*var(--u))] py-[calc(0.25*var(--u))] text-[calc(0.95*var(--u))] font-semibold uppercase tracking-[0.18em] text-summit-lilac/80">
            In progress
          </span>
        )}
        <span className="shrink-0 whitespace-nowrap text-[calc(1.05*var(--u))] tabular-nums text-summit-smoke">{fmtRange(s)}</span>
        <span className="ml-auto flex items-baseline gap-[calc(0.4*var(--u))] whitespace-nowrap pr-[calc(0.4*var(--u))]">
          <span className="text-[calc(0.9*var(--u))] uppercase tracking-[0.18em] text-summit-smoke">{overrun ? "Over by" : "Ends in"}</span>
          <Rolling
            text={fmtRemaining(Math.abs(remaining))}
            className={`font-[family-name:var(--font-archivo)] text-[calc(1.7*var(--u))] font-bold leading-none tabular-nums ${overrun ? "text-summit-cream" : "text-summit-lilac"}`}
          />
        </span>
      </div>
      <h2 className="line-clamp-2 font-[family-name:var(--font-archivo)] text-[calc(1.85*var(--u))] font-bold leading-[1.1] tracking-[-0.02em]">{s.title}</h2>
      <Speakers session={s} />
    </motion.div>
  );
}

function NextCell({ session, now, label }: { session: BoardSession | null; now: number; label: "Next" | "Then" }) {
  if (!session) {
    return (
      <motion.div key={`${label}-empty`} {...flip} className="flex h-full items-center">
        <p className="text-[calc(1.05*var(--u))] uppercase tracking-[0.2em] text-summit-smoke/50">—</p>
      </motion.div>
    );
  }
  const soon = +new Date(session.startsAt) - now <= 10 * 60_000;
  return (
    <motion.div key={session.id} {...flip} className="flex h-full flex-col justify-center gap-[calc(0.45*var(--u))]">
      <div className="flex flex-wrap items-center gap-[calc(0.7*var(--u))]">
        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-[calc(0.9*var(--u))] py-[calc(0.25*var(--u))] text-[calc(0.95*var(--u))] font-semibold uppercase tracking-[0.18em] ${
            label === "Next" ? "bg-summit-cerulean/15 text-summit-cerulean" : "bg-summit-lilac/8 text-summit-smoke"
          }`}
        >
          {label}
        </span>
        <span className="shrink-0 whitespace-nowrap text-[calc(1.05*var(--u))] tabular-nums text-summit-smoke">{fmtRange(session)}</span>
        {label === "Next" && (
          <span className="ml-auto pr-[calc(0.4*var(--u))]">
            <When iso={session.startsAt} now={now} size="text-[calc(1.5*var(--u))]" accent={soon} />
          </span>
        )}
      </div>
      <h3
        className={`line-clamp-2 font-[family-name:var(--font-archivo)] font-bold leading-[1.12] tracking-[-0.015em] ${
          label === "Next" ? "text-[calc(1.55*var(--u))] text-summit-lilac" : "text-[calc(1.25*var(--u))] text-summit-lilac/75"
        }`}
      >
        {session.title}
      </h3>
      <Speakers session={session} muted={label === "Then"} />
    </motion.div>
  );
}

/**
 * The lane's timeline, along the bottom edge of the whole card. Rendered by
 * the card rather than inside the Now cell: the cell flips with a 3D
 * transform, and a transform makes an element the containing block for its
 * absolute descendants, which would pin the bar to that one column.
 */
function LaneProgress({ session, now }: { session: BoardSession | null; now: number }) {
  if (!session) return null;
  const start = +new Date(session.startsAt);
  const end = +new Date(session.endsAt);
  const progress = Math.min(1, Math.max(0, (now - start) / Math.max(1, end - start)));
  const overrun = now > end;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[calc(0.35*var(--u))] bg-summit-lilac/8">
      <motion.div
        className={`h-full ${overrun ? "bg-summit-cream" : "bg-summit-cerise"}`}
        initial={false}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.9, ease: "linear" }}
      />
    </div>
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
  // Wide screens fit the whole programme by zooming the lanes; a phone
  // scrolls instead, so the zoom is switched off there.
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  // when the programme last loaded cleanly; drives the footer's health dot
  const [lastGood, setLastGood] = useState(0);
  // the query string has been read; nothing loads before then, or a demo
  // screen would make one real request before it knew it was a demo
  const [ready, setReady] = useState(false);

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

    // Instant path when this browser has a login: every event that changes
    // the schedule triggers a refetch. On a TV with no session the token
    // fetch fails and the poll above is all there is - that is fine.
    const EVENTS = ["session:status", "session:updated", "session:created", "session:deleted", "sessions:shifted", "speakers:revealed"];
    let sock: Awaited<ReturnType<typeof getSocket>> | null = null;
    const onChange = () => void load();
    if (!demo) {
      getSocket()
        .then((s) => {
          if (cancelled) return;
          sock = s;
          for (const ev of EVENTS) s.on(ev, onChange);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      clearInterval(id);
      if (sock) for (const ev of EVENTS) sock.off(ev, onChange);
    };
  }, [demo, ready]);

  const homes = useMemo(() => dayHomes(sessions ?? []), [sessions]);
  // `?day=N` still works: it resolves to the date that day number lives on.
  const date = useMemo(
    () => (sessions ? (dayOverride !== null ? (homes.get(dayOverride) ?? null) : pickDate(sessions, now)) : null),
    [sessions, now, dayOverride, homes],
  );
  const day = date !== null ? dayOfDate(homes, date) : null;
  const lanes = useMemo(
    () => (sessions && date !== null ? queueLanes(buildLanes(sessions.filter((s) => summitDateKey(s.startsAt) === date), now, roomOrder)) : []),
    [sessions, date, now, roomOrder],
  );

  // `now` is the ticking clock state, so this re-evaluates every second
  // without reading the wall clock during render
  const stale = error !== null && now - lastGood > STALE_MS;

  return (
    <main className="relative flex min-h-full w-full flex-col overflow-hidden px-[calc(3*var(--u))] py-[calc(2.2*var(--u))] md:h-full md:cursor-none">
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
      <header className="relative flex flex-col gap-[calc(1*var(--u))] border-b border-summit-lilac/10 pb-[calc(1.4*var(--u))] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[calc(1*var(--u))] uppercase tracking-[0.3em] text-summit-smoke">Gender &amp; Inclusion Summit 2026 · Abuja</p>
          <h1 className="mt-[calc(0.3*var(--u))] font-[family-name:var(--font-archivo)] text-[calc(3*var(--u))] font-bold leading-none tracking-[-0.03em]">
            Agenda board
            {/* "Day N" only when this date is where Day N lives; a stray
                date, such as a pre-summit test session, shows its date. */}
            {day !== null ? (
              <span className="ml-[calc(1.2*var(--u))] text-summit-cerise">Day {day}</span>
            ) : (
              date !== null && <span className="ml-[calc(1.2*var(--u))] text-summit-cerise">{shortDateFmt.format(new Date(`${date}T12:00:00+01:00`))}</span>
            )}
          </h1>
        </div>
        <div className="md:text-right">
          <p className="text-[calc(1*var(--u))] uppercase tracking-[0.3em] text-summit-smoke">{dateFmt.format(new Date(now))}</p>
          <Rolling
            text={clockFmt.format(new Date(now))}
            className="mt-[calc(0.2*var(--u))] font-[family-name:var(--font-archivo)] text-[calc(3.6*var(--u))] font-bold leading-none tracking-[-0.02em]"
          />
        </div>
      </header>

      {/*
        Everything below the header scales as one unit to fit the number of
        rooms: three rooms get the full size, six rooms get roughly half.
        CSS zoom rather than a font-size ladder because it scales spacing,
        borders and the progress bars in step with the type, so a six-room
        board looks like the same board, smaller, not a different layout.
      */}
      <div className="relative flex flex-col md:min-h-0 md:flex-1" style={{ zoom: wide ? Math.min(1, 3.4 / Math.max(1, lanes.length)) : 1 }}>
        {/* column legend */}
        <div className="relative mt-[calc(1.2*var(--u))] hidden grid-cols-[14vw_1fr_1fr_0.7fr] gap-[calc(2*var(--u))] px-[calc(1.2*var(--u))] text-[calc(0.9*var(--u))] uppercase tracking-[0.25em] text-summit-smoke/70 md:grid">
          <span>Room</span>
          <span>Now</span>
          <span>Next</span>
          <span>Then</span>
        </div>

        {/* lanes */}
        <LayoutGroup>
          <section className="relative mt-[calc(0.6*var(--u))] flex flex-col gap-[calc(0.9*var(--u))] md:min-h-0 md:flex-1" style={{ perspective: "1600px" }}>
            <AnimatePresence initial={false}>
              {lanes.map((lane) => (
                <motion.article
                  key={lane.room}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  className={`glass-card relative grid grid-cols-1 items-stretch gap-[calc(1.2*var(--u))] overflow-hidden px-[calc(1.6*var(--u))] py-[calc(1.2*var(--u))] md:min-h-0 md:flex-1 md:grid-cols-[14vw_1fr_1fr_0.7fr] md:gap-[calc(2*var(--u))] md:py-[calc(1*var(--u))] ${
                    lane.isLive ? "border-summit-cerise/30 shadow-[0_0_0_1px_rgb(229_37_154/0.15),0_24px_60px_rgb(229_37_154/0.12)]" : ""
                  }`}
                >
                  <div className="flex flex-col justify-center md:border-r md:border-summit-lilac/10 md:pr-[calc(1.5*var(--u))]">
                    <p className="text-[calc(0.9*var(--u))] uppercase tracking-[0.25em] text-summit-smoke">Room</p>
                    <p className="mt-[calc(0.2*var(--u))] font-[family-name:var(--font-archivo)] text-[calc(1.9*var(--u))] font-bold leading-[1.05] tracking-[-0.02em]">{lane.room}</p>
                  </div>
                  <div className="min-w-0" style={{ perspective: "1600px" }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <NowCell lane={lane} now={now} />
                    </AnimatePresence>
                  </div>
                  <div className="min-w-0 border-t border-summit-lilac/10 pt-[calc(1.2*var(--u))] md:border-t-0 md:border-l md:pl-[calc(1.6*var(--u))] md:pt-0" style={{ perspective: "1600px" }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <NextCell session={lane.next} now={now} label="Next" />
                    </AnimatePresence>
                  </div>
                  {/* a phone has no room for a third column; Then is a TV luxury */}
                  <div className="hidden min-w-0 border-l border-summit-lilac/10 pl-[calc(1.6*var(--u))] md:block" style={{ perspective: "1600px" }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <NextCell session={lane.later} now={now} label="Then" />
                    </AnimatePresence>
                  </div>
                  <LaneProgress session={lane.now} now={now} />
                </motion.article>
              ))}
            </AnimatePresence>

            {sessions === null && !error && (
              <div className="flex flex-1 items-center justify-center text-[calc(1.4*var(--u))] text-summit-smoke">Loading the programme…</div>
            )}
            {sessions !== null && lanes.length === 0 && (
              <div className="flex flex-1 items-center justify-center text-[calc(1.4*var(--u))] text-summit-smoke">Nothing scheduled for today.</div>
            )}
          </section>
        </LayoutGroup>
      </div>

      {/* footer */}
      <footer className="relative mt-[calc(1.2*var(--u))] flex items-center justify-between border-t border-summit-lilac/10 pt-[calc(1*var(--u))] text-[calc(0.9*var(--u))] uppercase tracking-[0.25em] text-summit-smoke/70">
        <span>All times West Africa Time</span>
        <span className="flex items-center gap-[calc(0.6*var(--u))]">
          <span className={`inline-block h-[calc(0.6*var(--u))] w-[calc(0.6*var(--u))] rounded-full ${stale ? "bg-summit-cream" : "bg-summit-green"}`} />
          {demo ? "Demo programme" : stale ? "Reconnecting to the programme" : "Live programme"}
        </span>
      </footer>
    </main>
  );
}
