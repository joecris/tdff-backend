import { pgTable, pgEnum, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  // Auth0 subject claim (e.g. "auth0|abc123") — nullable because seeded/dev
  // users won't have one until real Auth0 login lands. Unique so a lookup
  // by sub can never resolve to more than one local user.
  auth0Sub: varchar('auth0_sub', { length: 255 }).unique(),
  pictureUrl: varchar('picture_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof usersTable.$inferSelect;
export type NewUserRow = typeof usersTable.$inferInsert;
