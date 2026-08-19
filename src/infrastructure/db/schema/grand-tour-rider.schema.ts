import { pgTable, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { grandToursTable } from './grand-tour.schema';
import { ridersTable } from './rider.schema';

export const grandTourRidersTable = pgTable(
  'grand_tour_riders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    grandTourId: uuid('grand_tour_id')
      .notNull()
      .references(() => grandToursTable.id),
    riderId: uuid('rider_id')
      .notNull()
      .references(() => ridersTable.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('grand_tour_riders_grand_tour_id_rider_id_idx').on(
      table.grandTourId,
      table.riderId,
    ),
    index('grand_tour_riders_rider_id_idx').on(table.riderId),
  ],
).enableRLS();

export type GrandTourRiderRow = typeof grandTourRidersTable.$inferSelect;
export type NewGrandTourRiderRow = typeof grandTourRidersTable.$inferInsert;
