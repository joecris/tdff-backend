import { db } from '@infrastructure/db/client';
import { env } from '@infrastructure/config/env';
import { AuthVerifierPort } from '@shared/auth/auth-verifier.port';
import { DevAuthVerifier } from '@infrastructure/auth/dev-auth-verifier';

import { DrizzleUserRepository } from '@modules/user/adapters/outbound/persistence/drizzle-user.repository';
import { UserService } from '@modules/user/application/user.service';
import { UserController } from '@modules/user/adapters/inbound/http/user.controller';

import { DrizzleGrandTourRepository } from '@modules/grand-tours/adapters/outbound/persistence/drizzle-grand-tour.repository';
import { DrizzleGrandTourTeamRepository } from '@modules/grand-tours/adapters/outbound/persistence/drizzle-grand-tour-team.repository';
import { DrizzleGrandTourRiderRepository } from '@modules/grand-tours/adapters/outbound/persistence/drizzle-grand-tour-rider.repository';
import { GrandTourService } from '@modules/grand-tours/application/grand-tour.service';
import { GrandTourParticipationService } from '@modules/grand-tours/application/grand-tour-participation.service';
import { GrandTourController } from '@modules/grand-tours/adapters/inbound/http/grand-tour.controller';
import { GrandTourParticipationController } from '@modules/grand-tours/adapters/inbound/http/grand-tour-participation.controller';

import { DrizzleTeamRepository } from '@modules/teams/adapters/outbound/persistence/drizzle-team.repository';
import { TeamService } from '@modules/teams/application/team.service';
import { TeamController } from '@modules/teams/adapters/inbound/http/team.controller';

import { DrizzleRiderRepository } from '@modules/riders/adapters/outbound/persistence/drizzle-rider.repository';
import { RiderService } from '@modules/riders/application/rider.service';
import { RiderController } from '@modules/riders/adapters/inbound/http/rider.controller';

import { DrizzleFantasyLeagueRepository } from '@modules/fantasy-leagues/adapters/outbound/persistence/drizzle-fantasy-league.repository';
import { DrizzleFantasyLeagueMemberRepository } from '@modules/fantasy-leagues/adapters/outbound/persistence/drizzle-fantasy-league-member.repository';
import { FantasyLeagueService } from '@modules/fantasy-leagues/application/fantasy-league.service';
import { FantasyLeagueController } from '@modules/fantasy-leagues/adapters/inbound/http/fantasy-league.controller';

import { DrizzleScoringRepository } from '@modules/scoring/adapters/outbound/persistence/drizzle-scoring.repository';
import { ScoringService } from '@modules/scoring/application/scoring.service';
import { ScoringController } from '@modules/scoring/adapters/inbound/http/scoring.controller';

import { DrizzleCompetitionRepository } from '@modules/competitions/adapters/outbound/persistence/drizzle-competition.repository';
import { DrizzleCompetitionEntryRepository } from '@modules/competitions/adapters/outbound/persistence/drizzle-competition-entry.repository';
import { DrizzleCompetitionResultRepository } from '@modules/competitions/adapters/outbound/persistence/drizzle-competition-result.repository';
import { CompetitionService } from '@modules/competitions/application/competition.service';
import { CompetitionController } from '@modules/competitions/adapters/inbound/http/competition.controller';

/**
 * Composition root. The only place concrete adapters (Drizzle repository)
 * get wired into use cases/services. Everything downstream of this file
 * depends on interfaces (ports), not on this wiring.
 *
 * Kept as plain factory functions — swap for awilix/tsyringe later if
 * manual wiring becomes unwieldy across many modules.
 */
function buildUserModule() {
  const userRepository = new DrizzleUserRepository(db);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  return { userRepository, userService, userController };
}

function buildGrandTourModule() {
  const grandTourRepository = new DrizzleGrandTourRepository(db);
  const grandTourService = new GrandTourService(grandTourRepository);
  const grandTourController = new GrandTourController(grandTourService);

  return { grandTourRepository, grandTourService, grandTourController };
}

function buildTeamModule() {
  const teamRepository = new DrizzleTeamRepository(db);
  const teamService = new TeamService(teamRepository);
  const teamController = new TeamController(teamService);

  return { teamRepository, teamService, teamController };
}

/**
 * First module whose factory takes another module's *service* (not
 * repository) as an argument — `riders` validates `teamId` against the
 * teams module's inbound port. Every module after this one that needs a
 * cross-module read (fantasy-leagues -> grand-tours, competitions ->
 * scoring, etc.) follows the same shape.
 */
function buildRiderModule(teamService: TeamService) {
  const riderRepository = new DrizzleRiderRepository(db);
  const riderService = new RiderService(riderRepository, teamService);
  const riderController = new RiderController(riderService);

  return { riderRepository, riderService, riderController };
}

/**
 * Start-list management for a grand tour — lives alongside `grandTour` in
 * the same module but built separately (own service/controller, see
 * grand-tour-participation-service.port.ts for why). Depends on the grand
 * tour's own repository (same-module check) plus both teams' and riders'
 * services (cross-module checks).
 */
function buildGrandTourParticipationModule(
  grandTourRepository: DrizzleGrandTourRepository,
  teamService: TeamService,
  riderService: RiderService,
) {
  const grandTourTeamRepository = new DrizzleGrandTourTeamRepository(db);
  const grandTourRiderRepository = new DrizzleGrandTourRiderRepository(db);
  const grandTourParticipationService = new GrandTourParticipationService(
    grandTourTeamRepository,
    grandTourRiderRepository,
    grandTourRepository,
    teamService,
    riderService,
  );
  const grandTourParticipationController = new GrandTourParticipationController(
    grandTourParticipationService,
  );

  return {
    grandTourTeamRepository,
    grandTourRiderRepository,
    grandTourParticipationService,
    grandTourParticipationController,
  };
}

function buildFantasyLeagueModule(grandTourService: GrandTourService, userService: UserService) {
  const fantasyLeagueRepository = new DrizzleFantasyLeagueRepository(db);
  const memberRepository = new DrizzleFantasyLeagueMemberRepository(db);
  const fantasyLeagueService = new FantasyLeagueService(
    fantasyLeagueRepository,
    memberRepository,
    grandTourService,
    userService,
  );
  const fantasyLeagueController = new FantasyLeagueController(fantasyLeagueService);

  return {
    fantasyLeagueRepository,
    memberRepository,
    fantasyLeagueService,
    fantasyLeagueController,
  };
}

/**
 * No dependency on `competitions` at all, deliberately — its Drizzle
 * repository reads directly across the competitions/entries/results
 * tables itself (see drizzle-scoring.repository.ts), rather than going
 * through the competitions module's service. That's what keeps this
 * one-directional: `competitions` depends on `scoring` (below), never the
 * reverse.
 */
function buildScoringModule() {
  const scoringRepository = new DrizzleScoringRepository(db);
  const scoringService = new ScoringService(scoringRepository);
  const scoringController = new ScoringController(scoringService);

  return { scoringRepository, scoringService, scoringController };
}

/**
 * Deepest cross-module dependency chain so far: validates `fantasyLeagueId`
 * (fantasy-leagues), the submitting user (user), confirms each entry/result
 * selection's rider/team actually belongs to the competition's grand tour
 * (grand-tours' participation service) — see submit-competition-entry.usecase.ts
 * — and, on results specifically, triggers `scoringService.recalculateCompetitionScores`
 * (see submit-competition-results.usecase.ts). `scoring` is built before
 * this module for exactly that reason.
 */
function buildCompetitionModule(
  fantasyLeagueService: FantasyLeagueService,
  userService: UserService,
  grandTourParticipationService: GrandTourParticipationService,
  scoringService: ScoringService,
) {
  const competitionRepository = new DrizzleCompetitionRepository(db);
  const competitionEntryRepository = new DrizzleCompetitionEntryRepository(db);
  const competitionResultRepository = new DrizzleCompetitionResultRepository(db);
  const competitionService = new CompetitionService(
    competitionRepository,
    competitionEntryRepository,
    competitionResultRepository,
    fantasyLeagueService,
    userService,
    grandTourParticipationService,
    scoringService,
  );
  const competitionController = new CompetitionController(competitionService);

  return {
    competitionRepository,
    competitionEntryRepository,
    competitionResultRepository,
    competitionService,
    competitionController,
  };
}

/**
 * Picks the concrete `AuthVerifierPort` implementation off `AUTH_MODE`.
 * Everything downstream (`authenticate` middleware, every route) depends
 * only on the interface — flipping this to a real Auth0 verifier later is
 * a new `case` here, not a change anywhere else.
 */
function buildAuthVerifier(userRepository: DrizzleUserRepository): AuthVerifierPort {
  switch (env.AUTH_MODE) {
    case 'dev':
      return new DevAuthVerifier(userRepository);
    case 'auth0':
      throw new Error('AUTH_MODE=auth0 is not implemented yet — use AUTH_MODE=dev.');
  }
}

export function buildContainer() {
  const user = buildUserModule();
  const grandTour = buildGrandTourModule();
  const team = buildTeamModule();
  const rider = buildRiderModule(team.teamService);
  const grandTourParticipation = buildGrandTourParticipationModule(
    grandTour.grandTourRepository,
    team.teamService,
    rider.riderService,
  );
  const fantasyLeague = buildFantasyLeagueModule(grandTour.grandTourService, user.userService);
  const scoring = buildScoringModule();
  const competition = buildCompetitionModule(
    fantasyLeague.fantasyLeagueService,
    user.userService,
    grandTourParticipation.grandTourParticipationService,
    scoring.scoringService,
  );
  const authVerifier = buildAuthVerifier(user.userRepository);

  return {
    user,
    grandTour,
    team,
    rider,
    grandTourParticipation,
    fantasyLeague,
    scoring,
    competition,
    authVerifier,
  };
}

export type Container = ReturnType<typeof buildContainer>;
