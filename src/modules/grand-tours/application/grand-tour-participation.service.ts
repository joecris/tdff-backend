import { GrandTourTeam } from '../domain/entities/grand-tour-team.entity';
import { GrandTourRider } from '../domain/entities/grand-tour-rider.entity';
import { GrandTourRepositoryPort } from '../domain/ports/grand-tour-repository.port';
import { GrandTourTeamRepositoryPort } from '../domain/ports/grand-tour-team-repository.port';
import { GrandTourRiderRepositoryPort } from '../domain/ports/grand-tour-rider-repository.port';
import {
  AddRiderToGrandTourInput,
  AddTeamToGrandTourInput,
  GrandTourParticipationServicePort,
} from '../domain/ports/grand-tour-participation-service.port';
import { TeamServicePort } from '@modules/teams/domain/ports/team-service.port';
import { RiderServicePort } from '@modules/riders/domain/ports/rider-service.port';
import { AddTeamToGrandTourUseCase } from './use-cases/add-team-to-grand-tour.usecase';
import { AddRiderToGrandTourUseCase } from './use-cases/add-rider-to-grand-tour.usecase';
import { ListGrandTourTeamsUseCase } from './use-cases/list-grand-tour-teams.usecase';
import { ListGrandTourRidersUseCase } from './use-cases/list-grand-tour-riders.usecase';
import { GetGrandTourTeamUseCase } from './use-cases/get-grand-tour-team.usecase';
import { GetGrandTourRiderUseCase } from './use-cases/get-grand-tour-rider.usecase';

export class GrandTourParticipationService implements GrandTourParticipationServicePort {
  private readonly addTeamUseCase: AddTeamToGrandTourUseCase;
  private readonly addRiderUseCase: AddRiderToGrandTourUseCase;
  private readonly listTeamsUseCase: ListGrandTourTeamsUseCase;
  private readonly listRidersUseCase: ListGrandTourRidersUseCase;
  private readonly getTeamUseCase: GetGrandTourTeamUseCase;
  private readonly getRiderUseCase: GetGrandTourRiderUseCase;

  constructor(
    grandTourTeamRepository: GrandTourTeamRepositoryPort,
    grandTourRiderRepository: GrandTourRiderRepositoryPort,
    grandTourRepository: GrandTourRepositoryPort,
    teamService: TeamServicePort,
    riderService: RiderServicePort,
  ) {
    this.addTeamUseCase = new AddTeamToGrandTourUseCase(
      grandTourTeamRepository,
      grandTourRepository,
      teamService,
    );
    this.addRiderUseCase = new AddRiderToGrandTourUseCase(
      grandTourRiderRepository,
      grandTourRepository,
      riderService,
    );
    this.listTeamsUseCase = new ListGrandTourTeamsUseCase(
      grandTourTeamRepository,
      grandTourRepository,
    );
    this.listRidersUseCase = new ListGrandTourRidersUseCase(
      grandTourRiderRepository,
      grandTourRepository,
    );
    this.getTeamUseCase = new GetGrandTourTeamUseCase(grandTourTeamRepository);
    this.getRiderUseCase = new GetGrandTourRiderUseCase(grandTourRiderRepository);
  }

  addTeam(input: AddTeamToGrandTourInput): Promise<GrandTourTeam> {
    return this.addTeamUseCase.execute(input);
  }

  addRider(input: AddRiderToGrandTourInput): Promise<GrandTourRider> {
    return this.addRiderUseCase.execute(input);
  }

  listTeams(grandTourId: string): Promise<GrandTourTeam[]> {
    return this.listTeamsUseCase.execute(grandTourId);
  }

  listRiders(grandTourId: string): Promise<GrandTourRider[]> {
    return this.listRidersUseCase.execute(grandTourId);
  }

  getGrandTourTeamById(id: string): Promise<GrandTourTeam> {
    return this.getTeamUseCase.execute(id);
  }

  getGrandTourRiderById(id: string): Promise<GrandTourRider> {
    return this.getRiderUseCase.execute(id);
  }
}
