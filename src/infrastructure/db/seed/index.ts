import { env } from '@infrastructure/config/env';
import { buildContainer } from '@infrastructure/config/di-container';
import { closeDb } from '@infrastructure/db/client';
import { clearDb } from './clear-db';
import { seedUsers } from './user.seed';
import { seedGrandTours } from './grand-tour.seed';
import { seedTeams } from './team.seed';
import { seedRiders } from './rider.seed';
import { seedGrandTourTeams } from './grand-tour-team.seed';
import { seedGrandTourRiders } from './grand-tour-rider.seed';
import { seedFantasyLeagues } from './fantasy-league.seed';
import { seedFantasyLeagueMembers } from './fantasy-league-member.seed';
import { seedCompetitions } from './competition.seed';

/**
 * Dev/test-only data seeding, run through the same composition root and
 * services the real app uses (not raw SQL) — add a new module's seeder
 * here the same way it's added to di-container.ts / routes.ts.
 */
async function main(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    throw new Error('Refusing to run the seed script with NODE_ENV=production.');
  }

  // Printed every run, unconditionally — cheap, visible confirmation of
  // what's about to be wiped. NODE_ENV=production is blocked above, but
  // that doesn't catch a dev NODE_ENV accidentally pointed at a real
  // DATABASE_URL — this at least makes that mistake visible before it happens.
  const dbUrl = new URL(env.DATABASE_URL);
  console.warn(`Target database: ${dbUrl.hostname}${dbUrl.pathname} (NODE_ENV=${env.NODE_ENV})`);

  const container = buildContainer();

  console.warn('Clearing existing data...');
  await clearDb();

  console.warn('Seeding users...');
  const users = await seedUsers(container.user.userService);

  console.warn('Seeding grand tours...');
  const grandTours = await seedGrandTours(container.grandTour.grandTourService);

  console.warn('Seeding teams...');
  const teams = await seedTeams(container.team.teamService);

  console.warn('Seeding riders...');
  const riders = await seedRiders(container.rider.riderService, teams);

  console.warn('Adding teams to grand tour start list...');
  await seedGrandTourTeams(
    container.grandTourParticipation.grandTourParticipationService,
    grandTours,
    teams,
  );

  console.warn('Adding riders to grand tour start list...');
  await seedGrandTourRiders(
    container.grandTourParticipation.grandTourParticipationService,
    grandTours,
    riders,
  );

  console.warn('Seeding fantasy leagues...');
  const fantasyLeagues = await seedFantasyLeagues(
    container.fantasyLeague.fantasyLeagueService,
    grandTours,
  );

  console.warn('Seeding fantasy league members...');
  await seedFantasyLeagueMembers(
    container.fantasyLeague.fantasyLeagueService,
    fantasyLeagues,
    users,
  );

  console.warn('Seeding competitions...');
  await seedCompetitions(container.competition.competitionService, fantasyLeagues);

  console.warn('Seed complete.');
}

/**
 * Drizzle wraps the driver's pg error inside `.cause`, so the actual
 * "relation does not exist" text lives one level down, not on the
 * top-level error's own `message` — walk the chain rather than checking
 * `err.message` alone.
 */
function hasMissingRelation(err: unknown): boolean {
  let current: unknown = err;
  for (let depth = 0; current instanceof Error && depth < 5; depth += 1) {
    if (/relation .* does not exist/.test(current.message)) return true;
    current = current.cause;
  }
  return false;
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    if (hasMissingRelation(err)) {
      console.error('Hint: run `npm run db:migrate` before seeding.');
    }
    process.exitCode = 1;
  })
  .finally(() => closeDb());
