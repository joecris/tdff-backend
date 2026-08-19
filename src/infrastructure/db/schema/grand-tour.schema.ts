import { pgTable, uuid, varchar, timestamp, date } from 'drizzle-orm/pg-core';

export const grandToursTable = pgTable('grand_tours', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  startDate: date('start_date', { mode: 'date' }),
  endDate: date('end_date', { mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type GrandTourRow = typeof grandToursTable.$inferSelect;
export type NewGrandTourRow = typeof grandToursTable.$inferInsert;
