import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { AddTeamToGrandTourUseCase } from '@modules/grand-tours/application/use-cases/add-team-to-grand-tour.usecase';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import {
  GrandTourNotFoundError,
  TeamAlreadyInGrandTourError,
} from '@modules/grand-tours/domain/errors/grand-tour.errors';
import { TeamService } from '@modules/teams/application/team.service';
import { TeamNotFoundError } from '@modules/teams/domain/errors/team.errors';
import { FakeGrandTourRepository } from './fake-grand-tour.repository';
import { FakeGrandTourTeamRepository } from './fake-grand-tour-team.repository';
import { FakeTeamRepository } from '../teams/fake-team.repository';

describe('AddTeamToGrandTourUseCase', () => {
  let grandTourRepository: FakeGrandTourRepository;
  let grandTourTeamRepository: FakeGrandTourTeamRepository;
  let teamService: TeamService;
  let useCase: AddTeamToGrandTourUseCase;
  let grandTour: GrandTour;

  beforeEach(async () => {
    grandTourRepository = new FakeGrandTourRepository();
    grandTourTeamRepository = new FakeGrandTourTeamRepository();
    teamService = new TeamService(new FakeTeamRepository());
    useCase = new AddTeamToGrandTourUseCase(
      grandTourTeamRepository,
      grandTourRepository,
      teamService,
    );

    grandTour = GrandTour.create({ id: randomUUID(), name: 'Tour de France' });
    await grandTourRepository.save(grandTour);
  });

  it('adds a team to the grand tour start list', async () => {
    const team = await teamService.createTeam({ name: 'UAE Team Emirates' });

    const grandTourTeam = await useCase.execute({ grandTourId: grandTour.id, teamId: team.id });

    expect(grandTourTeam.grandTourId).toBe(grandTour.id);
    expect(grandTourTeam.teamId).toBe(team.id);
  });

  it('throws GrandTourNotFoundError for an unknown grand tour', async () => {
    const team = await teamService.createTeam({ name: 'UAE Team Emirates' });

    await expect(
      useCase.execute({ grandTourId: '00000000-0000-0000-0000-000000000000', teamId: team.id }),
    ).rejects.toBeInstanceOf(GrandTourNotFoundError);
  });

  it('throws TeamNotFoundError for an unknown team', async () => {
    await expect(
      useCase.execute({
        grandTourId: grandTour.id,
        teamId: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toBeInstanceOf(TeamNotFoundError);
  });

  it('throws TeamAlreadyInGrandTourError when the team is already on the start list', async () => {
    const team = await teamService.createTeam({ name: 'UAE Team Emirates' });
    await useCase.execute({ grandTourId: grandTour.id, teamId: team.id });

    await expect(
      useCase.execute({ grandTourId: grandTour.id, teamId: team.id }),
    ).rejects.toBeInstanceOf(TeamAlreadyInGrandTourError);
  });
});
