import { pgTable, uuid, varchar, date, timestamp, index } from 'drizzle-orm/pg-core';
import { grandToursTable } from './grand-tour.schema';

export const fantasyLeaguesTable = pgTable(
  'fantasy_leagues',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }),
    grandTourId: uuid('grand_tour_id')
      .notNull()
      .references(() => grandToursTable.id),
    startDate: date('start_date', { mode: 'date' }),
    endDate: date('end_date', { mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('fantasy_leagues_grand_tour_id_idx').on(table.grandTourId)],
).enableRLS();

export type FantasyLeagueRow = typeof fantasyLeaguesTable.$inferSelect;
export type NewFantasyLeagueRow = typeof fantasyLeaguesTable.$inferInsert;
