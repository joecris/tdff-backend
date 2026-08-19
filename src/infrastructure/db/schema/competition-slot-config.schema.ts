import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { competitionsTable } from './competition.schema';

/**
 * Phase 4.5 — admin-configurable required slots + points, per competition
 * instance. Replaces the old static `type` -> slots/points TS dictionaries:
 * a row's existence makes its `slot` required for that competition's
 * entries/results, and `points` is what `scoring` awards for a match.
 * Two competitions (e.g. two `stage_winner` rows, one per stage) can
 * reference the same `slot` value with entirely different `points`.
 */
export const competitionSlotConfigsTable = pgTable(
  'competition_slot_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    competitionId: uuid('competition_id')
      .notNull()
      .references(() => competitionsTable.id),
    // varchar, not enum — same rationale as competition_entry_selections.slot.
    slot: varchar('slot', { length: 30 }).notNull(),
    points: integer('points').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('competition_slot_configs_competition_id_slot_idx').on(
      table.competitionId,
      table.slot,
    ),
  ],
).enableRLS();

export type CompetitionSlotConfigRow = typeof competitionSlotConfigsTable.$inferSelect;
export type NewCompetitionSlotConfigRow = typeof competitionSlotConfigsTable.$inferInsert;
