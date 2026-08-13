import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { CompetitionResult } from '@modules/competitions/domain/entities/competition-result.entity';
import {
  DuplicateResultSlotError,
  InvalidResultSelectionsError,
} from '@modules/competitions/domain/errors/competition.errors';

/**
 * The actual slot-completeness algorithm is exhaustively tested once via
 * selection-validation.test.ts (shared with CompetitionEntry). This file
 * only confirms CompetitionResult wires that shared logic to its OWN
 * error types, not CompetitionEntry's — the one thing that ISN'T shared.
 */
describe('CompetitionResult', () => {
  it('creates successfully when selections exactly match the required slots', () => {
    const result = CompetitionResult.create({
      id: randomUUID(),
      competitionId: randomUUID(),
      selections: [{ id: randomUUID(), slot: 'climber', grandTourRiderId: randomUUID() }],
      requiredSlots: ['climber'],
    });

    expect(result.selections).toHaveLength(1);
  });

  it('throws DuplicateResultSlotError (not DuplicateEntrySlotError) on a duplicate slot', () => {
    expect(() =>
      CompetitionResult.create({
        id: randomUUID(),
        competitionId: randomUUID(),
        selections: [
          { id: randomUUID(), slot: 'climber', grandTourRiderId: randomUUID() },
          { id: randomUUID(), slot: 'climber', grandTourRiderId: randomUUID() },
        ],
        requiredSlots: ['climber'],
      }),
    ).toThrow(DuplicateResultSlotError);
  });

  it('throws InvalidResultSelectionsError (not InvalidEntrySelectionsError) when a slot is missing', () => {
    expect(() =>
      CompetitionResult.create({
        id: randomUUID(),
        competitionId: randomUUID(),
        selections: [],
        requiredSlots: ['climber'],
      }),
    ).toThrow(InvalidResultSelectionsError);
  });

  it('updateSelections() fully replaces prior selections and updates submittedByUserId', () => {
    const result = CompetitionResult.create({
      id: randomUUID(),
      competitionId: randomUUID(),
      selections: [{ id: randomUUID(), slot: 'climber', grandTourRiderId: 'rider-a' }],
      requiredSlots: ['climber'],
    });

    const adminId = randomUUID();
    result.updateSelections(
      [{ id: randomUUID(), slot: 'climber', grandTourRiderId: 'rider-b' }],
      ['climber'],
      adminId,
    );

    expect(result.selections).toHaveLength(1);
    expect(result.selections[0]?.grandTourRiderId).toBe('rider-b');
    expect(result.submittedByUserId).toBe(adminId);
  });
});
