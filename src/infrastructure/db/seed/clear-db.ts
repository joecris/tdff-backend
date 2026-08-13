import { sql } from 'drizzle-orm';
import { db } from '@infrastructure/db/client';
import {
  usersTable,
  grandToursTable,
  teamsTable,
  ridersTable,
  grandTourTeamsTable,
  grandTourRidersTable,
  fantasyLeaguesTable,
  fantasyLeagueMembersTable,
  competitionsTable,
  competitionSlotConfigsTable,
  competitionEntriesTable,
  competitionEntrySelectionsTable,
  competitionResultsTable,
  competitionResultSelectionsTable,
  competitionEntryScoresTable,
  leagueLeaderboardEntriesTable,
} from '@infrastructure/db/schema';

/**
 * Wipes every seedable table. Deliberately reaches into Drizzle directly
 * rather than through a repository port — "delete everything" isn't a
 * domain operation any repository should expose, it's an infrastructure
 * maintenance concern, same category as running a migration.
 *
 * Caller (seed/index.ts) is responsible for gating this to non-production.
 * TRUNCATE ... CASCADE ignores FK/dependency ordering, so table order here
 * doesn't matter as new tables are added.
 */
export async function clearDb(): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE ${leagueLeaderboardEntriesTable}, ${competitionEntryScoresTable}, ${competitionResultSelectionsTable}, ${competitionResultsTable}, ${competitionEntrySelectionsTable}, ${competitionEntriesTable}, ${competitionSlotConfigsTable}, ${competitionsTable}, ${fantasyLeagueMembersTable}, ${fantasyLeaguesTable}, ${grandTourRidersTable}, ${grandTourTeamsTable}, ${grandToursTable}, ${usersTable}, ${ridersTable}, ${teamsTable} RESTART IDENTITY CASCADE`,
  );
}
