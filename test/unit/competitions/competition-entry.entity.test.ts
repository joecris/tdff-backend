import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  CompetitionEntry,
  SelectionInput,
} from '@modules/competitions/domain/entities/competition-entry.entity';
import {
  DuplicateEntrySlotError,
  InvalidEntrySelectionsError,
  InvalidSelectionPickError,
} from '@modules/competitions/domain/errors/competition.errors';

function selection(overrides: Partial<SelectionInput> = {}): SelectionInput {
  return { id: randomUUID(), slot: 'climber', grandTourRiderId: randomUUID(), ...overrides };
}

describe('CompetitionEntry slot-completeness invariant', () => {
  it('creates successfully when selections exactly match the required slots', () => {
    const entry = CompetitionEntry.create({
      id: randomUUID(),
      competitionId: randomUUID(),
      userId: randomUUID(),
      selections: [selection({ slot: 'climber' })],
      requiredSlots: ['climber'],
    });

    expect(entry.selections).toHaveLength(1);
    expect(entry.selections[0]?.slot).toBe('climber');
  });

  it('throws InvalidEntrySelectionsError when a required slot is missing', () => {
    expect(() =>
      CompetitionEntry.create({
        id: randomUUID(),
        competitionId: randomUUID(),
        userId: randomUUID(),
        selections: [],
        requiredSlots: ['climber'],
      }),
    ).toThrow(InvalidEntrySelectionsError);
  });

  it('throws InvalidEntrySelectionsError when an unexpected slot is provided', () => {
    expect(() =>
      CompetitionEntry.create({
        id: randomUUID(),
        competitionId: randomUUID(),
        userId: randomUUID(),
        selections: [selection({ slot: 'climber' }), selection({ slot: 'sprinter' })],
        requiredSlots: ['climber'],
      }),
    ).toThrow(InvalidEntrySelectionsError);
  });

  it('throws DuplicateEntrySlotError when the same slot appears twice', () => {
    expect(() =>
      CompetitionEntry.create({
        id: randomUUID(),
        competitionId: randomUUID(),
        userId: randomUUID(),
        selections: [
          selection({ slot: 'climber', grandTourRiderId: randomUUID() }),
          selection({ slot: 'climber', grandTourRiderId: randomUUID() }),
        ],
        requiredSlots: ['climber'],
      }),
    ).toThrow(DuplicateEntrySlotError);
  });

  it('throws InvalidSelectionPickError when a selection has neither a rider nor a team', () => {
    expect(() =>
      CompetitionEntry.create({
        id: randomUUID(),
        competitionId: randomUUID(),
        userId: randomUUID(),
        selections: [{ id: randomUUID(), slot: 'climber' }],
        requiredSlots: ['climber'],
      }),
    ).toThrow(InvalidSelectionPickError);
  });

  it('throws InvalidSelectionPickError when a selection has both a rider and a team', () => {
    expect(() =>
      CompetitionEntry.create({
        id: randomUUID(),
        competitionId: randomUUID(),
        userId: randomUUID(),
        selections: [
          selection({
            slot: 'climber',
            grandTourRiderId: randomUUID(),
            grandTourTeamId: randomUUID(),
          }),
        ],
        requiredSlots: ['climber'],
      }),
    ).toThrow(InvalidSelectionPickError);
  });

  it('updateSelections() fully replaces prior selections, not merges', () => {
    const entry = CompetitionEntry.create({
      id: randomUUID(),
      competitionId: randomUUID(),
      userId: randomUUID(),
      selections: [selection({ slot: 'climber', grandTourRiderId: 'rider-a' })],
      requiredSlots: ['climber'],
    });

    entry.updateSelections(
      [selection({ slot: 'climber', grandTourRiderId: 'rider-b' })],
      ['climber'],
    );

    expect(entry.selections).toHaveLength(1);
    expect(entry.selections[0]?.grandTourRiderId).toBe('rider-b');
  });

  it('updateSelections() re-validates and rejects an incomplete replacement', () => {
    const entry = CompetitionEntry.create({
      id: randomUUID(),
      competitionId: randomUUID(),
      userId: randomUUID(),
      selections: [selection({ slot: 'climber' })],
      requiredSlots: ['climber'],
    });

    expect(() => entry.updateSelections([], ['climber'])).toThrow(InvalidEntrySelectionsError);
  });
});
