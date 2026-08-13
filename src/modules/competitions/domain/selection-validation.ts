import { SelectionSlot } from '@shared/domain/selection-slot';
import { InvalidSelectionPickError } from './errors/competition.errors';

/**
 * Shared between `CompetitionEntry`/`CompetitionEntrySelection` (a user's
 * picks) and `CompetitionResult`/`CompetitionResultSelection` (the admin's
 * declared truth) — both are "a full set of slot picks" at this level, and
 * must satisfy the identical structural rules. Pure, no I/O; callers decide
 * which entity-specific error to raise for their own aggregate (see
 * `competition-entry.entity.ts` vs `competition-result.entity.ts`) so error
 * messages stay contextual even though the algorithm doesn't duplicate.
 */
export interface SlotCompletenessProblem {
  type: 'duplicate' | 'incomplete';
  duplicateSlot?: SelectionSlot;
  missing?: SelectionSlot[];
  unexpected?: string[];
}

export function findSlotCompletenessProblem(
  providedSlots: SelectionSlot[],
  requiredSlots: readonly SelectionSlot[],
): SlotCompletenessProblem | null {
  const seen = new Set<SelectionSlot>();
  for (const slot of providedSlots) {
    if (seen.has(slot)) {
      return { type: 'duplicate', duplicateSlot: slot };
    }
    seen.add(slot);
  }

  const requiredSet = new Set(requiredSlots);
  const missing = requiredSlots.filter((slot) => !seen.has(slot));
  const unexpected = providedSlots.filter((slot) => !requiredSet.has(slot));
  if (missing.length > 0 || unexpected.length > 0) {
    return { type: 'incomplete', missing, unexpected };
  }
  return null;
}

/** Not entity-specific — "exactly one pick" means the same thing for an
 * entry selection or a result selection, so this one error type is shared
 * as-is rather than duplicated per aggregate. */
export function assertExactlyOnePick(
  slot: SelectionSlot,
  grandTourRiderId: string | undefined,
  grandTourTeamId: string | undefined,
): void {
  const pickCount = [grandTourRiderId, grandTourTeamId].filter((v) => v !== undefined).length;
  if (pickCount !== 1) {
    throw new InvalidSelectionPickError(slot);
  }
}
