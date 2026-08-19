import { pgTable, uuid, varchar, timestamp, uniqueIndex, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { competitionResultsTable } from './competition-result.schema';
import { grandTourTeamsTable } from './grand-tour-team.schema';
import { grandTourRidersTable } from './grand-tour-rider.schema';

// Structural twin of competition-entry-selection.schema.ts — same shape,
// same check constraint, different parent (a result, not an entry).
export const competitionResultSelectionsTable = pgTable(
  'competition_result_selections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    resultId: uuid('result_id')
      .notNull()
      .references(() => competitionResultsTable.id),
    slot: varchar('slot', { length: 30 }).notNull(),
    grandTourRiderId: uuid('grand_tour_rider_id').references(() => grandTourRidersTable.id),
    grandTourTeamId: uuid('grand_tour_team_id').references(() => grandTourTeamsTable.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('competition_result_selections_result_id_slot_idx').on(table.resultId, table.slot),
    index('competition_result_selections_grand_tour_rider_id_idx').on(table.grandTourRiderId),
    index('competition_result_selections_grand_tour_team_id_idx').on(table.grandTourTeamId),
    check(
      'competition_result_selections_exactly_one_pick',
      sql`(${table.grandTourRiderId} is not null) != (${table.grandTourTeamId} is not null)`,
    ),
  ],
).enableRLS();

export type CompetitionResultSelectionRow = typeof competitionResultSelectionsTable.$inferSelect;
export type NewCompetitionResultSelectionRow = typeof competitionResultSelectionsTable.$inferInsert;
