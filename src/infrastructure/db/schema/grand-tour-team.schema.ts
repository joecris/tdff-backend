import { pgTable, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { grandToursTable } from './grand-tour.schema';
import { teamsTable } from './team.schema';

export const grandTourTeamsTable = pgTable(
  'grand_tour_teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    grandTourId: uuid('grand_tour_id')
      .notNull()
      .references(() => grandToursTable.id),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teamsTable.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('grand_tour_teams_grand_tour_id_team_id_idx').on(table.grandTourId, table.teamId),
    index('grand_tour_teams_team_id_idx').on(table.teamId),
  ],
).enableRLS();

export type GrandTourTeamRow = typeof grandTourTeamsTable.$inferSelect;
export type NewGrandTourTeamRow = typeof grandTourTeamsTable.$inferInsert;
