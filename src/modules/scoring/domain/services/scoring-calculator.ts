import { SelectionSlot } from '@shared/domain/selection-slot';
import { SlotPointsRuleSet } from './slot-points-rule-set';

/**
 * The minimal shape scoring needs from a selection — matches what both
 * `CompetitionEntrySelection` and `CompetitionResultSelection` expose, so
 * the calculator never needs to know which one it's looking at.
 */
export interface SlotPick {
  slot: SelectionSlot;
  grandTourRiderId?: string;
  grandTourTeamId?: string;
}

/**
 * Pure, zero I/O — the single highest-value, most-exhaustively-tested piece
 * of the whole feature (see the plan's Scoring Architecture notes). Matches
 * an entry's picks against the admin's declared result slot-by-slot; a
 * slot scores `ruleSet[slot]` points only when the entry's pick at that
 * slot is the SAME rider/team as the result's pick at that slot.
 *
 * `resultSelections: null` means no result has been declared yet (or one
 * was retracted) — every entry scores 0 in that case, not left unscored;
 * see recalculate-competition-scores.usecase.ts for why that specific
 * behavior (not a no-op) matters for the "idempotent from scratch" property.
 *
 * `ruleSet` is `Partial` — a slot with no configured points contributes 0,
 * rather than throwing. In practice every slot an entry can legally
 * reference already has a point value (both come from the same
 * competition's `competition_slot_configs`), so this is a defensive
 * fallback, not an expected path.
 */
export function calculateEntryScore(
  entrySelections: SlotPick[],
  resultSelections: SlotPick[] | null,
  ruleSet: SlotPointsRuleSet,
): number {
  if (!resultSelections) return 0;

  const resultBySlot = new Map<SelectionSlot, SlotPick>(
    resultSelections.map((pick) => [pick.slot, pick]),
  );

  let total = 0;
  for (const entryPick of entrySelections) {
    const resultPick = resultBySlot.get(entryPick.slot);
    if (!resultPick) continue;

    const matches =
      (entryPick.grandTourRiderId !== undefined &&
        entryPick.grandTourRiderId === resultPick.grandTourRiderId) ||
      (entryPick.grandTourTeamId !== undefined &&
        entryPick.grandTourTeamId === resultPick.grandTourTeamId);

    if (matches) {
      total += ruleSet[entryPick.slot] ?? 0;
    }
  }
  return total;
}
