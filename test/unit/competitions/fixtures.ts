import { randomUUID } from 'node:crypto';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { GrandTourService } from '@modules/grand-tours/application/grand-tour.service';
import { GrandTourParticipationService } from '@modules/grand-tours/application/grand-tour-participation.service';
import { TeamService } from '@modules/teams/application/team.service';
import { RiderService } from '@modules/riders/application/rider.service';
import { UserService } from '@modules/user/application/user.service';
import { FantasyLeagueService } from '@modules/fantasy-leagues/application/fantasy-league.service';
import { FakeGrandTourRepository } from '../grand-tours/fake-grand-tour.repository';
import { FakeGrandTourTeamRepository } from '../grand-tours/fake-grand-tour-team.repository';
import { FakeGrandTourRiderRepository } from '../grand-tours/fake-grand-tour-rider.repository';
import { FakeTeamRepository } from '../teams/fake-team.repository';
import { FakeRiderRepository } from '../riders/fake-rider.repository';
import { FakeUserRepository } from '../user/fake-user.repository';
import { FakeFantasyLeagueRepository } from '../fantasy-leagues/fake-fantasy-league.repository';
import { FakeFantasyLeagueMemberRepository } from '../fantasy-leagues/fake-fantasy-league-member.repository';
import { FakeCompetitionRepository } from './fake-competition.repository';
import { FakeCompetitionEntryRepository } from './fake-competition-entry.repository';

/**
 * `submit-competition-entry` sits at the bottom of the deepest cross-module
 * chain in the codebase (competitions -> fantasy-leagues -> grand-tours,
 * plus competitions -> grand-tours' participation service, plus -> user).
 * Building all of that by hand in every test file would dwarf the actual
 * assertions — this fixture wires the whole "world" once, over fakes only
 * at the persistence boundary, real application-layer code everywhere else
 * (same principle as every other module's tests in this codebase).
 */
export function buildCompetitionsFixture() {
  const grandTourRepository = new FakeGrandTourRepository();
  const grandTourTeamRepository = new FakeGrandTourTeamRepository();
  const grandTourRiderRepository = new FakeGrandTourRiderRepository();
  const teamRepository = new FakeTeamRepository();
  const riderRepository = new FakeRiderRepository();
  const userRepository = new FakeUserRepository();
  const fantasyLeagueRepository = new FakeFantasyLeagueRepository();
  const fantasyLeagueMemberRepository = new FakeFantasyLeagueMemberRepository();
  const competitionRepository = new FakeCompetitionRepository();
  const competitionEntryRepository = new FakeCompetitionEntryRepository();

  const teamService = new TeamService(teamRepository);
  const riderService = new RiderService(riderRepository, teamService);
  const userService = new UserService(userRepository);
  const grandTourService = new GrandTourService(grandTourRepository);
  const grandTourParticipationService = new GrandTourParticipationService(
    grandTourTeamRepository,
    grandTourRiderRepository,
    grandTourRepository,
    teamService,
    riderService,
  );
  const fantasyLeagueService = new FantasyLeagueService(
    fantasyLeagueRepository,
    fantasyLeagueMemberRepository,
    grandTourService,
    userService,
  );

  return {
    competitionRepository,
    competitionEntryRepository,
    userService,
    fantasyLeagueService,
    grandTourParticipationService,
    teamService,
    riderService,
    grandTourRepository,
  };
}

/** Seeds a grand tour + fantasy league, ready for a competition to attach to. */
export async function seedGrandTourAndLeague(fixture: ReturnType<typeof buildCompetitionsFixture>) {
  const grandTour = GrandTour.create({ id: randomUUID(), name: 'Tour de France' });
  await fixture.grandTourRepository.save(grandTour);

  const league = await fixture.fantasyLeagueService.createFantasyLeague({
    name: 'Tour de France Fantasy',
    grandTourId: grandTour.id,
  });

  return { grandTour, league };
}
