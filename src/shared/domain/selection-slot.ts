/**
 * The full catalog of pick "slots" a competition entry (or a result) can
 * reference. Lives in the shared kernel because both `competitions`
 * (entries) and, later, `scoring` need the same vocabulary.
 *
 * Deliberately a TS union backed by a `varchar` DB column, not a Postgres
 * enum — adding a new slot is then a pure code change (no
 * `ALTER TYPE ... ADD VALUE` migration). Which of these slots a given
 * competition actually requires (and how many points each is worth) is
 * admin-set per competition instance — see
 * `Competition.slots`/`competition_slot_configs`, not a static mapping
 * off this list.
 */
export const SELECTION_SLOTS = [
  'overall_team',
  'top_1',
  'top_2',
  'top_3',
  'climber',
  'sprinter',
  'rouleur',
  'puncheur',
] as const;

export type SelectionSlot = (typeof SELECTION_SLOTS)[number];

export function isSelectionSlot(value: string): value is SelectionSlot {
  return (SELECTION_SLOTS as readonly string[]).includes(value);
}
