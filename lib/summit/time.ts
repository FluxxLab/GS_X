/**
 * Summit-local time, in one place.
 *
 * The API speaks in instants (UTC ISO strings). The screens and the edit form
 * speak in Abuja wall-clock. Every crossing between the two has to name the
 * zone explicitly: a bare `Date` method picks whatever zone the code happens
 * to run in, which is UTC on the Worker and the laptop's zone in the browser,
 * and that is how a session lost an hour on every open-and-save.
 *
 * Lagos is UTC+01:00 all year with no DST, so a fixed offset is exact on the
 * way out and `Intl` with a named zone is exact on the way in.
 */
export const SUMMIT_TZ = "Africa/Lagos";
export const SUMMIT_OFFSET = "+01:00";

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: SUMMIT_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateLabelFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: SUMMIT_TZ,
  day: "numeric",
  month: "short",
});

const wallClockFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: SUMMIT_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "09:00" in Abuja, wherever this renders. */
export const fmtSummitTime = (iso: string) => timeFmt.format(new Date(iso));

/** "8 Sept" in Abuja, for day labels. */
export const fmtSummitDate = (iso: string) => dateLabelFmt.format(new Date(iso));

/**
 * Instant -> `YYYY-MM-DDTHH:mm` in Abuja wall-clock, the shape a
 * `datetime-local` input takes. Built from `formatToParts` rather than a
 * string slice so the hours are Abuja's and not UTC's.
 */
export function toSummitInput(iso: string | Date): string {
  const parts = Object.fromEntries(
    wallClockFmt.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/**
 * `YYYY-MM-DDTHH:mm` from a `datetime-local` input -> ISO with the summit
 * offset stamped on. Never `new Date(local)`: without an offset the runtime
 * guesses the zone, and the guess differs between server and browser.
 */
export const fromSummitInput = (local: string) => `${local}:00${SUMMIT_OFFSET}`;

/** Instant -> `YYYY-MM-DD` of the Abuja calendar date. */
export const summitDateKey = (iso: string | Date) => toSummitInput(iso).slice(0, 10);

/** "Tuesday 8 September" from a `YYYY-MM-DD` Abuja date key. */
const headingFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: SUMMIT_TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});
export const fmtSummitDateHeading = (dateKey: string) =>
  headingFmt.format(new Date(`${dateKey}T12:00:00${SUMMIT_OFFSET}`));
