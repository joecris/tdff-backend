import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { competitionsTable } from './competition.schema';
import { usersTable } from './user.schema';

export const competitionResultsTable = pgTable('competition_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Unique — one active result set per competition; resubmitting replaces
  // it (full-replace, see CompetitionResult.updateSelections), never adds
  // a second row.
  competitionId: uuid('competition_id')
    .notNull()
    .unique()
    .references(() => competitionsTable.id),
  submittedByUserId: uuid('submitted_by_user_id').references(() => usersTable.id),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CompetitionResultRow = typeof competitionResultsTable.$inferSelect;
export type NewCompetitionResultRow = typeof competitionResultsTable.$inferInsert;
