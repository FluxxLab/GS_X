import { describe, it, expect } from 'vitest';
import { humanize } from './format';

describe('humanize', () => {
  it('converts SNAKE_CASE to Title Case', () => {
    expect(humanize('FUEL_ENERGY')).toBe('Fuel Energy');
  });

  it('converts snake_case to Title Case', () => {
    expect(humanize('office_supplies')).toBe('Office Supplies');
  });

  it('handles a single word', () => {
    expect(humanize('approved')).toBe('Approved');
  });

  it('returns an em dash for null/undefined/empty', () => {
    expect(humanize(null)).toBe('—');
    expect(humanize(undefined)).toBe('—');
    expect(humanize('')).toBe('—');
  });
});
