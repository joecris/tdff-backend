import { pgTable, uuid, varchar, timestamp, uniqueIndex, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { competitionEntriesTable } from './competition-entry.schema';
import { grandTourTeamsTable } from './grand-tour-team.schema';
import { grandTourRidersTable } from './grand-tour-rider.schema';

export const competitionEntrySelectionsTable = pgTable(
  'competition_entry_selections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => competitionEntriesTable.id),
    // varchar, not enum — see shared/domain/selection-slot.ts for why.
    slot: varchar('slot', { length: 30 }).notNull(),
    // References the grand-tour-scoped start-list row (grand_tour_riders.id
    // / grand_tour_teams.id), never riders.id/teams.id directly — see
    // grand-tour-rider.schema.ts's doc comment for why that scoping matters.
    grandTourRiderId: uuid('grand_tour_rider_id').references(() => grandTourRidersTable.id),
    grandTourTeamId: uuid('grand_tour_team_id').references(() => grandTourTeamsTable.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('competition_entry_selections_entry_id_slot_idx').on(table.entryId, table.slot),
    index('competition_entry_selections_grand_tour_rider_id_idx').on(table.grandTourRiderId),
    index('competition_entry_selections_grand_tour_team_id_idx').on(table.grandTourTeamId),
    // Belt-and-suspenders alongside the identical check the domain entity
    // already enforces — DB-level guarantee that survives even a bypass of
    // the application layer (a raw migration/script, a future admin tool).
    check(
      'competition_entry_selections_exactly_one_pick',
      sql`(${table.grandTourRiderId} is not null) != (${table.grandTourTeamId} is not null)`,
    ),
  ],
).enableRLS();

export type CompetitionEntrySelectionRow = typeof competitionEntrySelectionsTable.$inferSelect;
export type NewCompetitionEntrySelectionRow = typeof competitionEntrySelectionsTable.$inferInsert;
