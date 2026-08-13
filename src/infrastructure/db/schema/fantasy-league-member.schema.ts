import { pgTable, pgEnum, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { fantasyLeaguesTable } from './fantasy-league.schema';
import { usersTable } from './user.schema';

export const fantasyLeagueMemberRoleEnum = pgEnum('fantasy_league_member_role', [
  'owner',
  'member',
]);

export const fantasyLeagueMembersTable = pgTable(
  'fantasy_league_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fantasyLeagueId: uuid('fantasy_league_id')
      .notNull()
      .references(() => fantasyLeaguesTable.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    role: fantasyLeagueMemberRoleEnum('role').notNull().default('member'),
    // No separate `joined_at` — `createdAt` already means "when this row
    // (i.e. this membership) came into existence," which for a membership
    // row is definitionally the join time.
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('fantasy_league_members_league_id_user_id_idx').on(
      table.fantasyLeagueId,
      table.userId,
    ),
    index('fantasy_league_members_user_id_idx').on(table.userId),
  ],
);

export type FantasyLeagueMemberRow = typeof fantasyLeagueMembersTable.$inferSelect;
export type NewFantasyLeagueMemberRow = typeof fantasyLeagueMembersTable.$inferInsert;
