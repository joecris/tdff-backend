import { randomUUID } from 'node:crypto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@infrastructure/db/schema';
import { usersTable } from '@infrastructure/db/schema/user.schema';
import { grandToursTable } from '@infrastructure/db/schema/grand-tour.schema';
import { teamsTable } from '@infrastructure/db/schema/team.schema';
import { ridersTable } from '@infrastructure/db/schema/rider.schema';
import { grandTourTeamsTable } from '@infrastructure/db/schema/grand-tour-team.schema';
import { grandTourRidersTable } from '@infrastructure/db/schema/grand-tour-rider.schema';
import { fantasyLeaguesTable } from '@infrastructure/db/schema/fantasy-league.schema';
import { competitionsTable } from '@infrastructure/db/schema/competition.schema';
import { competitionEntriesTable } from '@infrastructure/db/schema/competition-entry.schema';

/**
 * Builds the minimal real FK chain (grand tour -> team/rider on its start
 * list -> fantasy league -> competition -> entry) via direct Drizzle
 * inserts — deliberately bypassing the application layer, since these
 * tests exercise adapters/DB constraints directly, not use cases (those
 * are already covered by the fake-repository unit tests). Reused by every
 * integration test file that needs a real competition entry to hang a
 * selection or a score off of.
 */
export async function seedMinimalCompetitionFixture(db: NodePgDatabase<typeof schema>) {
  const [user] = await db
    .insert(usersTable)
    .values({
      id: randomUUID(),
      email: `rider-picker-${randomUUID()}@example.com`,
      name: 'Fixture User',
    })
    .returning();
  const [grandTour] = await db
    .insert(grandToursTable)
    .values({ id: randomUUID(), name: 'Fixture Grand Tour' })
    .returning();
  const [team] = await db
    .insert(teamsTable)
    .values({ id: randomUUID(), name: 'Fixture Team' })
    .returning();
  const [rider] = await db
    .insert(ridersTable)
    .values({ id: randomUUID(), name: 'Fixture Rider' })
    .returning();
  const [grandTourTeam] = await db
    .insert(grandTourTeamsTable)
    .values({ id: randomUUID(), grandTourId: grandTour!.id, teamId: team!.id })
    .returning();
  const [grandTourRider] = await db
    .insert(grandTourRidersTable)
    .values({ id: randomUUID(), grandTourId: grandTour!.id, riderId: rider!.id })
    .returning();
  const [fantasyLeague] = await db
    .insert(fantasyLeaguesTable)
    .values({ id: randomUUID(), name: 'Fixture League', grandTourId: grandTour!.id })
    .returning();
  const [competition] = await db
    .insert(competitionsTable)
    .values({
      id: randomUUID(),
      name: 'Fixture Competition',
      type: 'gc_top3',
      fantasyLeagueId: fantasyLeague!.id,
    })
    .returning();
  const [entry] = await db
    .insert(competitionEntriesTable)
    .values({ id: randomUUID(), competitionId: competition!.id, userId: user!.id })
    .returning();

  return {
    user: user!,
    grandTour: grandTour!,
    team: team!,
    rider: rider!,
    grandTourTeam: grandTourTeam!,
    grandTourRider: grandTourRider!,
    fantasyLeague: fantasyLeague!,
    competition: competition!,
    entry: entry!,
  };
}
