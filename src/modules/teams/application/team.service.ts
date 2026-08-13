import { Team } from '../domain/entities/team.entity';
import { TeamRepositoryPort } from '../domain/ports/team-repository.port';
import { CreateTeamInput, TeamServicePort } from '../domain/ports/team-service.port';
import { BulkImportResult } from '@shared/excel/bulk-import-result';
import { CreateTeamUseCase } from './use-cases/create-team.usecase';
import { GetTeamUseCase } from './use-cases/get-team.usecase';
import { GetTeamByNameUseCase } from './use-cases/get-team-by-name.usecase';
import { BulkImportTeamsUseCase } from './use-cases/bulk-import-teams.usecase';

export class TeamService implements TeamServicePort {
  private readonly createTeamUseCase: CreateTeamUseCase;
  private readonly getTeamUseCase: GetTeamUseCase;
  private readonly getTeamByNameUseCase: GetTeamByNameUseCase;
  private readonly bulkImportTeamsUseCase: BulkImportTeamsUseCase;

  constructor(teamRepository: TeamRepositoryPort) {
    this.createTeamUseCase = new CreateTeamUseCase(teamRepository);
    this.getTeamUseCase = new GetTeamUseCase(teamRepository);
    this.getTeamByNameUseCase = new GetTeamByNameUseCase(teamRepository);
    this.bulkImportTeamsUseCase = new BulkImportTeamsUseCase(teamRepository);
  }

  createTeam(input: CreateTeamInput): Promise<Team> {
    return this.createTeamUseCase.execute(input);
  }

  getTeamById(id: string): Promise<Team> {
    return this.getTeamUseCase.execute(id);
  }

  getTeamByName(name: string): Promise<Team | null> {
    return this.getTeamByNameUseCase.execute(name);
  }

  bulkImportTeams(fileBuffer: Buffer): Promise<BulkImportResult> {
    return this.bulkImportTeamsUseCase.execute(fileBuffer);
  }
}
