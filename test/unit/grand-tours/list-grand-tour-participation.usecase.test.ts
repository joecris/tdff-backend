import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ListGrandTourTeamsUseCase } from '@modules/grand-tours/application/use-cases/list-grand-tour-teams.usecase';
import { ListGrandTourRidersUseCase } from '@modules/grand-tours/application/use-cases/list-grand-tour-riders.usecase';
import { AddTeamToGrandTourUseCase } from '@modules/grand-tours/application/use-cases/add-team-to-grand-tour.usecase';
import { AddRiderToGrandTourUseCase } from '@modules/grand-tours/application/use-cases/add-rider-to-grand-tour.usecase';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { GrandTourNotFoundError } from '@modules/grand-tours/domain/errors/grand-tour.errors';
import { TeamService } from '@modules/teams/application/team.service';
import { RiderService } from '@modules/riders/application/rider.service';
import { FakeGrandTourRepository } from './fake-grand-tour.repository';
import { FakeGrandTourTeamRepository } from './fake-grand-tour-team.repository';
import { FakeGrandTourRiderRepository } from './fake-grand-tour-rider.repository';
import { FakeTeamRepository } from '../teams/fake-team.repository';
import { FakeRiderRepository } from '../riders/fake-rider.repository';

describe('ListGrandTourTeamsUseCase / ListGrandTourRidersUseCase', () => {
  let grandTourRepository: FakeGrandTourRepository;
  let grandTour: GrandTour;
  let teamService: TeamService;
  let riderService: RiderService;
  let listTeams: ListGrandTourTeamsUseCase;
  let listRiders: ListGrandTourRidersUseCase;

  beforeEach(async () => {
    grandTourRepository = new FakeGrandTourRepository();
    const grandTourTeamRepository = new FakeGrandTourTeamRepository();
    const grandTourRiderRepository = new FakeGrandTourRiderRepository();
    teamService = new TeamService(new FakeTeamRepository());
    riderService = new RiderService(new FakeRiderRepository(), teamService);

    grandTour = GrandTour.create({ id: randomUUID(), name: 'Tour de France' });
    await grandTourRepository.save(grandTour);

    const team = await teamService.createTeam({ name: 'UAE Team Emirates' });
    const rider = await riderService.createRider({ name: 'Tadej Pogačar' });
    await new AddTeamToGrandTourUseCase(
      grandTourTeamRepository,
      grandTourRepository,
      teamService,
    ).execute({
      grandTourId: grandTour.id,
      teamId: team.id,
    });
    await new AddRiderToGrandTourUseCase(
      grandTourRiderRepository,
      grandTourRepository,
      riderService,
    ).execute({
      grandTourId: grandTour.id,
      riderId: rider.id,
    });

    listTeams = new ListGrandTourTeamsUseCase(grandTourTeamRepository, grandTourRepository);
    listRiders = new ListGrandTourRidersUseCase(grandTourRiderRepository, grandTourRepository);
  });

  it('lists teams on the start list', async () => {
    const teams = await listTeams.execute(grandTour.id);
    expect(teams).toHaveLength(1);
  });

  it('lists riders on the start list', async () => {
    const riders = await listRiders.execute(grandTour.id);
    expect(riders).toHaveLength(1);
  });

  it('throws GrandTourNotFoundError when listing teams for an unknown grand tour', async () => {
    await expect(listTeams.execute('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      GrandTourNotFoundError,
    );
  });
});
