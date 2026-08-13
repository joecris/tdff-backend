import { describe, it, expect } from 'vitest';
import { calculateEntryScore, SlotPick } from '@modules/scoring/domain/services/scoring-calculator';
import { SlotPointsRuleSet } from '@modules/scoring/domain/services/slot-points-rule-set';

const RULE_SET: SlotPointsRuleSet = {
  overall_team: 5,
  top_1: 10,
  top_2: 7,
  top_3: 5,
  climber: 10,
  sprinter: 10,
  rouleur: 8,
  puncheur: 8,
};

describe('calculateEntryScore', () => {
  it('returns 0 when no result has been declared', () => {
    const entry: SlotPick[] = [{ slot: 'climber', grandTourRiderId: 'rider-a' }];
    expect(calculateEntryScore(entry, null, RULE_SET)).toBe(0);
  });

  it('returns 0 for an entry with no selections at all', () => {
    expect(
      calculateEntryScore([], [{ slot: 'climber', grandTourRiderId: 'rider-a' }], RULE_SET),
    ).toBe(0);
  });

  it('awards full points when every slot matches (full match)', () => {
    const entry: SlotPick[] = [
      { slot: 'top_1', grandTourRiderId: 'rider-a' },
      { slot: 'top_2', grandTourRiderId: 'rider-b' },
    ];
    const result: SlotPick[] = [
      { slot: 'top_1', grandTourRiderId: 'rider-a' },
      { slot: 'top_2', grandTourRiderId: 'rider-b' },
    ];
    expect(calculateEntryScore(entry, result, RULE_SET)).toBe(10 + 7);
  });

  it('awards points only for matching slots (partial match)', () => {
    const entry: SlotPick[] = [
      { slot: 'top_1', grandTourRiderId: 'rider-a' },
      { slot: 'top_2', grandTourRiderId: 'rider-wrong' },
    ];
    const result: SlotPick[] = [
      { slot: 'top_1', grandTourRiderId: 'rider-a' },
      { slot: 'top_2', grandTourRiderId: 'rider-b' },
    ];
    expect(calculateEntryScore(entry, result, RULE_SET)).toBe(10);
  });

  it('awards 0 when nothing matches (zero match)', () => {
    const entry: SlotPick[] = [{ slot: 'climber', grandTourRiderId: 'rider-a' }];
    const result: SlotPick[] = [{ slot: 'climber', grandTourRiderId: 'rider-b' }];
    expect(calculateEntryScore(entry, result, RULE_SET)).toBe(0);
  });

  it('does not award points for a slot the result never declared', () => {
    const entry: SlotPick[] = [{ slot: 'sprinter', grandTourRiderId: 'rider-a' }];
    const result: SlotPick[] = [{ slot: 'climber', grandTourRiderId: 'rider-a' }];
    expect(calculateEntryScore(entry, result, RULE_SET)).toBe(0);
  });

  it('matches a team pick correctly, independent of any rider picks', () => {
    const entry: SlotPick[] = [{ slot: 'overall_team', grandTourTeamId: 'team-a' }];
    const result: SlotPick[] = [{ slot: 'overall_team', grandTourTeamId: 'team-a' }];
    expect(calculateEntryScore(entry, result, RULE_SET)).toBe(5);
  });

  it('does not cross-match a rider pick against a team pick in the same slot', () => {
    // Malformed in practice (validated against at submission time), but the
    // calculator itself should never treat "some id" as interchangeable
    // between the two pick kinds.
    const entry: SlotPick[] = [{ slot: 'overall_team', grandTourRiderId: 'x' }];
    const result: SlotPick[] = [{ slot: 'overall_team', grandTourTeamId: 'x' }];
    expect(calculateEntryScore(entry, result, RULE_SET)).toBe(0);
  });
});
