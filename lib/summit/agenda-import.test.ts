import { describe, it, expect } from 'vitest';
import { normaliseAgenda } from './agenda-import';

/** A row in the shape the published agenda workbook actually exports. */
const row = (over: Record<string, unknown> = {}) => ({
  Title: 'Opening Ceremony',
  Description: 'Welcome remarks.',
  Day: '2026-09-08',
  StartAt: '9:30 AM',
  endsAt: '10:15 AM',
  room: 'Main Hall',
  track: 'Economic Inclusion',
  type: 'Welcome',
  audience: 'General / not specified',
  ...over,
});

describe('normaliseAgenda', () => {
  it('turns the agenda date into the 1..2 bucket the API caps', () => {
    const r = normaliseAgenda([row(), row({ Day: '2026-09-09' })]);
    expect(r.errors).toEqual([]);
    expect(r.sessions.map((s) => s.day)).toEqual([1, 2]);
    expect(r.days).toEqual([
      { day: 1, date: '2026-09-08', count: 1 },
      { day: 2, date: '2026-09-09', count: 1 },
    ]);
  });

  it('reads an Excel serial date, which is what tripped the @Max(2)', () => {
    // 46273 is 2026-09-08 in Excel's serial calendar. The old importer passed
    // this straight through as `day`.
    const r = normaliseAgenda([row({ Day: 46273 })]);
    expect(r.errors).toEqual([]);
    expect(r.sessions[0].day).toBe(1);
    expect(r.sessions[0].startsAt.slice(0, 10)).toBe('2026-09-08');
  });

  it('emits WAT-offset ISO, not a UTC-shifted local conversion', () => {
    const [s] = normaliseAgenda([row()]).sessions;
    expect(s.startsAt).toBe('2026-09-08T09:30:00+01:00');
    expect(s.endsAt).toBe('2026-09-08T10:15:00+01:00');
  });

  it('reads a bare Excel time fraction', () => {
    // 0.5 is midday; the old importer sent this where an ISO string was due.
    const [s] = normaliseAgenda([row({ StartAt: 0.5, endsAt: 0.75 })]).sessions;
    expect(s.startsAt).toBe('2026-09-08T12:00:00+01:00');
    expect(s.endsAt).toBe('2026-09-08T18:00:00+01:00');
  });

  it('puts 12-hour noon and midnight on the right side of the clock', () => {
    const [s] = normaliseAgenda([
      row({ StartAt: '12:05 AM', endsAt: '12:05 PM' }),
    ]).sessions;
    expect(s.startsAt).toContain('T00:05:00');
    expect(s.endsAt).toContain('T12:05:00');
  });

  it('maps the five thematic labels onto the database enum', () => {
    const labels = {
      'Inclusive Digital Transformation': 'digital',
      'Economic Inclusion': 'economic',
      GBV: 'gbv',
      'Health & Nutrition': 'health',
      'Security & Transportation': 'security',
    };
    for (const [label, track] of Object.entries(labels)) {
      expect(normaliseAgenda([row({ track: label })]).sessions[0].track).toBe(track);
    }
  });

  it('files programme buckets under general rather than a real track', () => {
    for (const label of ['Registration', 'Networking & Breaks', 'Plenary', 'To Be Confirmed']) {
      expect(normaliseAgenda([row({ track: label })]).sessions[0].track).toBe('general');
    }
  });

  it('rejects a track label it has never seen instead of guessing', () => {
    const r = normaliseAgenda([row({ track: 'Climate Finance' })]);
    expect(r.sessions).toEqual([]);
    expect(r.errors[0].reason).toContain('Climate Finance');
  });

  it('catches an AM/PM typo that would store a negative-length session', () => {
    const r = normaliseAgenda([row({ StartAt: '11:20 AM', endsAt: '12:05 AM' })]);
    expect(r.sessions).toEqual([]);
    expect(r.errors[0].row).toBe(2); // header is row 1
  });

  it('keeps good rows when a neighbour fails, so one typo is not a blocked import', () => {
    const r = normaliseAgenda([row(), row({ Title: '', track: 'Registration' }), row()]);
    expect(r.sessions).toHaveLength(2);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].reason).toBe('no title');
  });

  it('fills the NOT NULL columns a blank cell would otherwise break', () => {
    const [s] = normaliseAgenda([row({ Description: '', room: '' })]).sessions;
    expect(s.description).toBe('Opening Ceremony'); // falls back to the title
    expect(s.room).toBe('TBC');
  });

  it('reads headers regardless of case and spelling', () => {
    const r = normaliseAgenda([
      { title: 'X', Date: '2026-09-08', 'Start Time': '9:00 AM', End: '10:00 AM', Track: 'GBV', Type: 'Panel' },
    ]);
    expect(r.errors).toEqual([]);
    expect(r.sessions[0]).toMatchObject({ day: 1, track: 'gbv', type: 'Panel' });
  });

  it('refuses a sheet spanning more than the two days the API allows', () => {
    const r = normaliseAgenda([row(), row({ Day: '2026-09-09' }), row({ Day: '2026-09-10' })]);
    expect(r.sessions).toHaveLength(2);
    expect(r.errors[0].reason).toContain('3 dates');
  });
});
