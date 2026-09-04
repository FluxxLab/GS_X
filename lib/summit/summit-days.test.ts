import { describe, it, expect } from 'vitest';
import { dayHomes, dayOfDate } from './summit-days';

const at = (date: string, hhmm: string) => `${date}T${hhmm}:00+01:00`;

describe('dayHomes', () => {
  it('gives each day number the date carrying most of its sessions', () => {
    const homes = dayHomes([
      { day: 1, startsAt: at('2026-09-08', '09:00') },
      { day: 1, startsAt: at('2026-09-08', '10:30') },
      { day: 1, startsAt: at('2026-09-07', '12:20') }, // a test session filed as Day 1
      { day: 2, startsAt: at('2026-09-09', '09:00') },
    ]);
    expect(homes.get(1)).toBe('2026-09-08');
    expect(homes.get(2)).toBe('2026-09-09');
  });

  it('reads the Abuja date, so a late-evening UTC time does not slip a day', () => {
    // 23:30Z on the 7th is 00:30 on the 8th in Abuja
    const homes = dayHomes([{ day: 1, startsAt: '2026-09-07T23:30:00.000Z' }]);
    expect(homes.get(1)).toBe('2026-09-08');
  });
});

describe('dayOfDate', () => {
  const homes = dayHomes([
    { day: 1, startsAt: at('2026-09-08', '09:00') },
    { day: 1, startsAt: at('2026-09-07', '12:20') },
  ]);

  it('names the day a programme date has earned', () => {
    expect(dayOfDate(homes, '2026-09-08')).toBe(1);
  });

  it('returns null for a stray date, even one filed under a day number', () => {
    expect(dayOfDate(homes, '2026-09-07')).toBeNull();
  });
});
