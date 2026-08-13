import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import { InvalidFantasyLeagueDateRangeError } from '@modules/fantasy-leagues/domain/errors/fantasy-league.errors';

describe('FantasyLeague date-range invariant', () => {
  it('allows creation with no dates', () => {
    expect(() =>
      FantasyLeague.create({ id: randomUUID(), name: 'League', grandTourId: randomUUID() }),
    ).not.toThrow();
  });

  it('allows endDate on or after startDate', () => {
    expect(() =>
      FantasyLeague.create({
        id: randomUUID(),
        name: 'League',
        grandTourId: randomUUID(),
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-21'),
      }),
    ).not.toThrow();
  });

  it('rejects endDate before startDate on create', () => {
    expect(() =>
      FantasyLeague.create({
        id: randomUUID(),
        name: 'League',
        grandTourId: randomUUID(),
        startDate: new Date('2026-05-21'),
        endDate: new Date('2026-05-01'),
      }),
    ).toThrow(InvalidFantasyLeagueDateRangeError);
  });

  it('rejects an updateDetails() that would make endDate precede the existing startDate', () => {
    const league = FantasyLeague.create({
      id: randomUUID(),
      name: 'League',
      grandTourId: randomUUID(),
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-21'),
    });

    expect(() => league.updateDetails({ endDate: new Date('2026-04-01') })).toThrow(
      InvalidFantasyLeagueDateRangeError,
    );
  });
});
