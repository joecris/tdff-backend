import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { fantasyLeaguesTable } from './fantasy-league.schema';

export const competitionsTable = pgTable(
  'competitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }),
    // Purely descriptive/category label (Phase 4.5) — required slots and
    // their points are no longer derived from this value, see
    // `competition_slot_configs`/`Competition.slots`. Deliberately a
    // varchar, not a Postgres enum — same reasoning as `slot`: the real
    // set of classifications (GC, KOM, points/sprinters, young rider,
    // combativity, per-stage winners, ...) isn't a small closed set, and
    // since this column no longer drives any logic, forcing a migration
    // per new category would buy nothing.
    type: varchar('type', { length: 50 }).notNull(),
    fantasyLeagueId: uuid('fantasy_league_id')
      .notNull()
      .references(() => fantasyLeaguesTable.id),
    // Cosmetic — a banner/thumbnail for this competition, same treatment
    // as teams.logo_url/riders.image_url (plain nullable varchar, no
    // format enforcement at the DB level).
    imageUrl: varchar('image_url', { length: 500 }),
    // Provisioned, not enforced in v1 — see plan's "Entry lock deadline" default.
    entryLockAt: timestamp('entry_lock_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('competitions_fantasy_league_id_idx').on(table.fantasyLeagueId)],
).enableRLS();

export type CompetitionRow = typeof competitionsTable.$inferSelect;
export type NewCompetitionRow = typeof competitionsTable.$inferInsert;
