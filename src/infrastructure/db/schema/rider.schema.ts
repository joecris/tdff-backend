import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { teamsTable } from './team.schema';

export const ridersTable = pgTable(
  'riders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    nationality: varchar('nationality', { length: 100 }),
    imageUrl: varchar('image_url', { length: 500 }),
    // Informational rider specialty (climber/sprinter/etc.) — free text,
    // deliberately not an enum; not the same axis as competition entry slots.
    type: varchar('type', { length: 50 }),
    teamId: uuid('team_id').references(() => teamsTable.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('riders_team_id_idx').on(table.teamId)],
);

export type RiderRow = typeof ridersTable.$inferSelect;
export type NewRiderRow = typeof ridersTable.$inferInsert;
