import { pgTable, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { competitionsTable } from './competition.schema';
import { usersTable } from './user.schema';

export const competitionEntriesTable = pgTable(
  'competition_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    competitionId: uuid('competition_id')
      .notNull()
      .references(() => competitionsTable.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One entry per user per competition — the plan's decision #4.
    uniqueIndex('competition_entries_competition_id_user_id_idx').on(
      table.competitionId,
      table.userId,
    ),
    index('competition_entries_user_id_idx').on(table.userId),
  ],
).enableRLS();

export type CompetitionEntryRow = typeof competitionEntriesTable.$inferSelect;
export type NewCompetitionEntryRow = typeof competitionEntriesTable.$inferInsert;
