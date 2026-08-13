import { SelectionSlot } from '@shared/domain/selection-slot';

// Partial, not a full Record — since Phase 4.5, the real rule set for a
// recalculation is built per-competition from `competition_slot_configs`
// (only that competition's own required slots have a points value, not
// all 8). See `RecalculateCompetitionScoresUseCase`.
export type SlotPointsRuleSet = Partial<Record<SelectionSlot, number>>;

/**
 * Seed/test convenience only — no longer consumed by the recalculation use
 * case itself (each competition carries its own points via
 * `competition_slot_configs`). Kept around as a sensible default for seed
 * data and as a full-coverage fixture for the calculator's own unit tests.
 */
export const DEFAULT_SLOT_POINTS_RULE_SET: SlotPointsRuleSet = {
  overall_team: 5,
  top_1: 10,
  top_2: 7,
  top_3: 5,
  climber: 10,
  sprinter: 10,
  rouleur: 8,
  puncheur: 8,
};
