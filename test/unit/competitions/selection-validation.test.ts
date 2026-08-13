import { describe, it, expect } from 'vitest';
import {
  assertExactlyOnePick,
  findSlotCompletenessProblem,
} from '@modules/competitions/domain/selection-validation';
import { InvalidSelectionPickError } from '@modules/competitions/domain/errors/competition.errors';

describe('findSlotCompletenessProblem', () => {
  it('returns null when the provided slots exactly match the required ones', () => {
    expect(findSlotCompletenessProblem(['climber'], ['climber'])).toBeNull();
  });

  it('reports a duplicate slot before checking completeness', () => {
    const problem = findSlotCompletenessProblem(['climber', 'climber'], ['climber']);
    expect(problem).toEqual({ type: 'duplicate', duplicateSlot: 'climber' });
  });

  it('reports missing required slots', () => {
    const problem = findSlotCompletenessProblem([], ['climber', 'sprinter']);
    expect(problem).toEqual({
      type: 'incomplete',
      missing: ['climber', 'sprinter'],
      unexpected: [],
    });
  });

  it('reports unexpected slots not in the required set', () => {
    const problem = findSlotCompletenessProblem(['climber', 'sprinter'], ['climber']);
    expect(problem).toEqual({ type: 'incomplete', missing: [], unexpected: ['sprinter'] });
  });
});

describe('assertExactlyOnePick', () => {
  it('passes when exactly a rider id is set', () => {
    expect(() => assertExactlyOnePick('climber', 'rider-a', undefined)).not.toThrow();
  });

  it('passes when exactly a team id is set', () => {
    expect(() => assertExactlyOnePick('overall_team', undefined, 'team-a')).not.toThrow();
  });

  it('throws InvalidSelectionPickError when neither is set', () => {
    expect(() => assertExactlyOnePick('climber', undefined, undefined)).toThrow(
      InvalidSelectionPickError,
    );
  });

  it('throws InvalidSelectionPickError when both are set', () => {
    expect(() => assertExactlyOnePick('climber', 'rider-a', 'team-a')).toThrow(
      InvalidSelectionPickError,
    );
  });
});
