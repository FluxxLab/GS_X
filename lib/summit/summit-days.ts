import { summitDateKey } from "./time";

/**
 * Which Abuja calendar date each day number really belongs to.
 *
 * `day` is a free choice on the session form and nothing makes it agree
 * with `startsAt`, so a 7 Sept test session can sit in the database filed
 * under Day 1 next to the real 8 Sept programme. The screens group by date
 * and use this to decide which date has earned the "Day N" label: the one
 * carrying most of that day's sessions, read off the agenda rather than
 * hardcoded. Any other date claiming the same number is a stray. A tie goes
 * to the later date: a stray is nearly always a rehearsal run before the
 * summit, not a leftover after it.
 */
export function dayHomes(
  sessions: ReadonlyArray<{ day: number; startsAt: string }>,
): Map<number, string> {
  const tally = new Map<number, Map<string, number>>();
  for (const s of sessions) {
    const key = summitDateKey(s.startsAt);
    const perDate = tally.get(s.day) ?? new Map<string, number>();
    perDate.set(key, (perDate.get(key) ?? 0) + 1);
    tally.set(s.day, perDate);
  }
  const homes = new Map<number, string>();
  for (const [day, perDate] of tally) {
    const [home] = [...perDate.entries()].sort(
      (a, b) => b[1] - a[1] || b[0].localeCompare(a[0]),
    )[0];
    homes.set(day, home);
  }
  return homes;
}

/** The day number a date has earned, or null when it is not a programme day. */
export function dayOfDate(homes: Map<number, string>, dateKey: string): number | null {
  for (const [day, home] of homes) if (home === dateKey) return day;
  return null;
}
