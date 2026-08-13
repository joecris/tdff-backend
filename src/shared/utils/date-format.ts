/**
 * Shared DD-MM-YYYY <-> Date helpers for calendar-only fields (no time-of-day).
 * Always read/write with UTC methods, never local-time ones — this keeps a
 * date immune to the server's timezone and matches how Drizzle's
 * `date(..., { mode: 'date' })` columns round-trip (`toISOString()` /
 * `new Date(driverString)`, both UTC). Reuse across any module/entity that
 * exposes date-only fields over HTTP, rather than re-deriving this per DTO.
 */

const DATE_FORMAT_REGEX = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export function isDdMmYyyyFormat(value: string): boolean {
  return DATE_FORMAT_REGEX.test(value);
}

/**
 * Parses a DD-MM-YYYY string into a UTC-midnight Date, or returns null if
 * it isn't a real calendar date (e.g. "31-02-2024"). Callers should check
 * `isDdMmYyyyFormat` first (or handle null) — this does not itself validate
 * the string shape, only whether the parsed numbers form a real date.
 */
export function parseDdMmYyyy(value: string): Date | null {
  const day = Number(value.slice(0, 2));
  const month = Number(value.slice(3, 5));
  const year = Number(value.slice(6, 10));
  const date = new Date(Date.UTC(year, month - 1, day));

  const isValidCalendarDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

  return isValidCalendarDate ? date : null;
}

/** Formats a Date as DD-MM-YYYY, reading UTC components. */
export function formatDdMmYyyy(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getUTCFullYear()}`;
}
