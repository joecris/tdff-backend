import { pgTable, uuid, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { competitionEntriesTable } from './competition-entry.schema';
import { competitionsTable } from './competition.schema';
import { usersTable } from './user.schema';

export const competitionEntryScoresTable = pgTable(
  'competition_entry_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Unique — 1:1 with the entry. Recalculation always overwrites this
    // row (onConflictDoUpdate targets entryId), never inserts a second
    // one — that's what makes recalculation idempotent-from-scratch.
    entryId: uuid('entry_id')
      .notNull()
      .unique()
      .references(() => competitionEntriesTable.id),
    // Denormalized (also reachable via entryId -> competition_entries) —
    // avoids a join on the hot read path (GET /competitions/:id/scores)
    // and on the leaderboard aggregation query.
    competitionId: uuid('competition_id')
      .notNull()
      .references(() => competitionsTable.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    score: integer('score').notNull().default(0),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('competition_entry_scores_competition_id_idx').on(table.competitionId),
    index('competition_entry_scores_user_id_idx').on(table.userId),
  ],
).enableRLS();

export type CompetitionEntryScoreRow = typeof competitionEntryScoresTable.$inferSelect;
export type NewCompetitionEntryScoreRow = typeof competitionEntryScoresTable.$inferInsert;
