import { describe, it, expect } from 'vitest';
import { planImport } from './agenda-apply';
import type { AgendaRow } from './agenda-import';
import type { Session } from './sessions';

/**
 * Re-importing a revised agenda must edit what is there, not add it twice.
 * These pin down which existing session a row is taken to be, and what is
 * reported as left over.
 */
const at = (date: string, hhmm: string) => `${date}T${hhmm}:00+01:00`;

const row = (over: Partial<AgendaRow['session']>, n = 2): AgendaRow => ({
  row: n,
  session: {
    title: 'Opening Plenary',
    description: 'Opening Plenary',
    day: 1,
    startsAt: at('2026-09-08', '09:00'),
    endsAt: at('2026-09-08', '10:00'),
    room: 'Main Hall',
    track: 'general',
    type: 'Plenary',
    ...over,
  },
  speakers: [],
  skippedSpeakers: [],
});

const session = (id: string, over: Partial<Session>): Session => ({
  id,
  title: 'Opening Plenary',
  day: 1,
  // the API returns UTC; 09:00 Abuja is 08:00Z
  startsAt: '2026-09-08T08:00:00.000Z',
  endsAt: '2026-09-08T09:00:00.000Z',
  room: 'Main Hall',
  track: 'general',
  type: 'Plenary',
  status: 'scheduled',
  ...over,
});

describe('planImport', () => {
  it('matches an unchanged row by title and start, across the UTC/WAT boundary', () => {
    const s = session('a', {});
    const { matches, stale } = planImport([row({})], [s]);
    expect(matches).toEqual([s]);
    expect(stale).toEqual([]);
  });

  it('matches a retitled row by day, room and start', () => {
    const s = session('a', { title: 'Is There Hope for Creatives in Nigeria?' });
    const { matches } = planImport([row({ title: 'Creativity That Pays' })], [s]);
    expect(matches[0]?.id).toBe('a');
  });

  it('matches a moved row by day, room and title', () => {
    const s = session('a', { startsAt: '2026-09-08T15:00:00.000Z', endsAt: '2026-09-08T15:45:00.000Z' });
    const { matches } = planImport(
      [row({ startsAt: at('2026-09-08', '15:50'), endsAt: at('2026-09-08', '17:20') })],
      [s],
    );
    expect(matches[0]?.id).toBe('a');
  });

  it('lets a session be claimed once, so a room clash in the sheet does not overwrite', () => {
    // one session in the database at 16:00 Main Hall; the sheet has two rows
    // there - the original, and a new one that clashes with it
    const s = session('a', { title: 'Inclusive Wellbeing', startsAt: '2026-09-09T15:00:00.000Z', endsAt: '2026-09-09T15:45:00.000Z', day: 2 });
    const rows = [
      row({ title: 'Tech Justice', day: 2, startsAt: at('2026-09-09', '16:00'), endsAt: at('2026-09-09', '17:00') }, 2),
      row({ title: 'Inclusive Wellbeing', day: 2, startsAt: at('2026-09-09', '16:00'), endsAt: at('2026-09-09', '16:45') }, 3),
    ];
    const { matches } = planImport(rows, [s]);
    // title wins over slot even though Tech Justice comes first in the sheet
    expect(matches[0]).toBeNull();
    expect(matches[1]?.id).toBe('a');
  });

  it('reports sessions on the sheet dates that no row claimed, and nothing off those dates', () => {
    const kept = session('a', {});
    const dropped = session('b', { title: 'Launch of the Nigerian Youth Charter', room: 'TBC', startsAt: '2026-09-08T14:30:00.000Z', endsAt: '2026-09-08T15:00:00.000Z' });
    const test = session('c', { title: 'Hestel test', startsAt: '2026-09-07T11:20:00.000Z', endsAt: '2026-09-07T12:00:00.000Z', room: 'Hestel' });
    const { stale } = planImport([row({})], [kept, dropped, test]);
    expect(stale.map((s) => s.id)).toEqual(['b']);
  });
});
