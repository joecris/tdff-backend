import { Team } from '../../domain/entities/team.entity';
import { TeamRepositoryPort } from '../../domain/ports/team-repository.port';
import { TeamNotFoundError } from '../../domain/errors/team.errors';

export class GetTeamUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(id: string): Promise<Team> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new TeamNotFoundError(id);
    }
    return team;
  }
}
