import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Competition } from '@modules/competitions/domain/entities/competition.entity';
import {
  DuplicateCompetitionSlotError,
  EmptyCompetitionSlotsError,
  InvalidSlotPointsError,
} from '@modules/competitions/domain/errors/competition.errors';

function baseProps() {
  return {
    id: randomUUID(),
    name: 'GC Top 3',
    type: 'gc_top3',
    fantasyLeagueId: randomUUID(),
  };
}

describe('Competition slot config validation', () => {
  it('creates a competition with a valid slot config', () => {
    const competition = Competition.create({
      ...baseProps(),
      slots: [
        { slot: 'top_1', points: 10 },
        { slot: 'top_2', points: 7 },
      ],
    });

    expect(competition.slots).toEqual([
      { slot: 'top_1', points: 10 },
      { slot: 'top_2', points: 7 },
    ]);
    expect(competition.requiredSlots).toEqual(['top_1', 'top_2']);
  });

  it('throws EmptyCompetitionSlotsError when no slots are given', () => {
    expect(() => Competition.create({ ...baseProps(), slots: [] })).toThrow(
      EmptyCompetitionSlotsError,
    );
  });

  it('throws DuplicateCompetitionSlotError when the same slot appears twice', () => {
    expect(() =>
      Competition.create({
        ...baseProps(),
        slots: [
          { slot: 'top_1', points: 10 },
          { slot: 'top_1', points: 5 },
        ],
      }),
    ).toThrow(DuplicateCompetitionSlotError);
  });

  it('throws InvalidSlotPointsError for zero points', () => {
    expect(() =>
      Competition.create({ ...baseProps(), slots: [{ slot: 'top_1', points: 0 }] }),
    ).toThrow(InvalidSlotPointsError);
  });

  it('throws InvalidSlotPointsError for negative points', () => {
    expect(() =>
      Competition.create({ ...baseProps(), slots: [{ slot: 'top_1', points: -5 }] }),
    ).toThrow(InvalidSlotPointsError);
  });

  it('throws InvalidSlotPointsError for non-integer points', () => {
    expect(() =>
      Competition.create({ ...baseProps(), slots: [{ slot: 'top_1', points: 1.5 }] }),
    ).toThrow(InvalidSlotPointsError);
  });

  it('updateSlots replaces the slot config wholesale and re-validates', () => {
    const competition = Competition.create({
      ...baseProps(),
      slots: [{ slot: 'top_1', points: 10 }],
    });

    competition.updateSlots([
      { slot: 'top_1', points: 20 },
      { slot: 'top_2', points: 15 },
    ]);

    expect(competition.slots).toEqual([
      { slot: 'top_1', points: 20 },
      { slot: 'top_2', points: 15 },
    ]);
  });

  it('updateSlots rejects an invalid replacement, leaving the prior config untouched', () => {
    const competition = Competition.create({
      ...baseProps(),
      slots: [{ slot: 'top_1', points: 10 }],
    });

    expect(() => competition.updateSlots([])).toThrow(EmptyCompetitionSlotsError);
    expect(competition.slots).toEqual([{ slot: 'top_1', points: 10 }]);
  });
});

describe('Competition.updateDetails (imageUrl)', () => {
  it('trims and sets imageUrl on create', () => {
    const competition = Competition.create({
      ...baseProps(),
      slots: [{ slot: 'top_1', points: 10 }],
      imageUrl: '  https://example.com/banner.png  ',
    });

    expect(competition.imageUrl).toBe('https://example.com/banner.png');
  });

  it('leaves imageUrl undefined when not provided', () => {
    const competition = Competition.create({
      ...baseProps(),
      slots: [{ slot: 'top_1', points: 10 }],
    });

    expect(competition.imageUrl).toBeUndefined();
  });

  it('updateDetails sets imageUrl and bumps updatedAt', () => {
    const competition = Competition.create({
      ...baseProps(),
      slots: [{ slot: 'top_1', points: 10 }],
    });
    const before = competition.updatedAt;

    competition.updateDetails({ imageUrl: 'https://example.com/new-banner.png' });

    expect(competition.imageUrl).toBe('https://example.com/new-banner.png');
    expect(competition.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('updateDetails with an empty updates object leaves imageUrl untouched', () => {
    const competition = Competition.create({
      ...baseProps(),
      slots: [{ slot: 'top_1', points: 10 }],
      imageUrl: 'https://example.com/original.png',
    });

    competition.updateDetails({});

    expect(competition.imageUrl).toBe('https://example.com/original.png');
  });

  it('updateDetails never touches slots', () => {
    const competition = Competition.create({
      ...baseProps(),
      slots: [{ slot: 'top_1', points: 10 }],
    });

    competition.updateDetails({ imageUrl: 'https://example.com/banner.png' });

    expect(competition.slots).toEqual([{ slot: 'top_1', points: 10 }]);
  });
});
