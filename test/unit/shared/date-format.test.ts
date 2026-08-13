import { describe, it, expect } from 'vitest';
import { isDdMmYyyyFormat, parseDdMmYyyy, formatDdMmYyyy } from '@shared/utils/date-format';

describe('isDdMmYyyyFormat', () => {
  it('accepts a well-formed DD-MM-YYYY string', () => {
    expect(isDdMmYyyyFormat('01-07-2026')).toBe(true);
  });

  it.each([
    ['2026-07-01', 'ISO order instead of DD-MM-YYYY'],
    ['1-7-2026', 'missing zero-padding'],
    ['32-01-2026', 'day out of the regex range (32)'],
    ['01-13-2026', 'month out of the regex range (13)'],
    ['not-a-date', 'not a date at all'],
    ['', 'empty string'],
  ])('rejects %s (%s)', (value) => {
    expect(isDdMmYyyyFormat(value)).toBe(false);
  });
});

describe('parseDdMmYyyy', () => {
  it('parses a valid date to UTC midnight', () => {
    const date = parseDdMmYyyy('01-07-2026');
    expect(date?.toISOString()).toBe('2026-07-01T00:00:00.000Z');
  });

  it('accepts Feb 29 on a leap year', () => {
    expect(parseDdMmYyyy('29-02-2024')).not.toBeNull();
  });

  it('returns null for Feb 29 on a non-leap year — the actual reason this function exists instead of a bare `new Date()` call', () => {
    // new Date(Date.UTC(2023, 1, 29)) silently rolls over to March 1st;
    // this function must catch that and reject it instead.
    expect(parseDdMmYyyy('29-02-2023')).toBeNull();
  });

  it('returns null for a day that overflows its month (e.g. April 31st)', () => {
    expect(parseDdMmYyyy('31-04-2026')).toBeNull();
  });
});

describe('formatDdMmYyyy', () => {
  it('formats a UTC date as DD-MM-YYYY with zero-padding', () => {
    expect(formatDdMmYyyy(new Date(Date.UTC(2026, 0, 5)))).toBe('05-01-2026');
  });

  it('round-trips through parseDdMmYyyy', () => {
    const original = '25-12-2026';
    const parsed = parseDdMmYyyy(original);
    expect(parsed).not.toBeNull();
    expect(formatDdMmYyyy(parsed!)).toBe(original);
  });
});
