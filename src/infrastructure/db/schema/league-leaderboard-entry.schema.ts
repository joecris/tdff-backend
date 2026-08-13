import { pgTable, uuid, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { fantasyLeaguesTable } from './fantasy-league.schema';
import { usersTable } from './user.schema';

export const leagueLeaderboardEntriesTable = pgTable(
  'league_leaderboard_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fantasyLeagueId: uuid('fantasy_league_id')
      .notNull()
      .references(() => fantasyLeaguesTable.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    totalScore: integer('total_score').notNull().default(0),
    rank: integer('rank').notNull(),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Persisted/recomputed cache, not derived per-read — a leaderboard GET
    // is then a single indexed lookup, not a multi-table aggregate query.
    uniqueIndex('league_leaderboard_entries_league_id_user_id_idx').on(
      table.fantasyLeagueId,
      table.userId,
    ),
    index('league_leaderboard_entries_fantasy_league_id_idx').on(table.fantasyLeagueId),
  ],
);

export type LeagueLeaderboardEntryRow = typeof leagueLeaderboardEntriesTable.$inferSelect;
export type NewLeagueLeaderboardEntryRow = typeof leagueLeaderboardEntriesTable.$inferInsert;
