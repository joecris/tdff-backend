import { Team } from '../../domain/entities/team.entity';
import { TeamRepositoryPort } from '../../domain/ports/team-repository.port';

/**
 * Returns `null` for a missing name rather than throwing — unlike
 * `GetTeamUseCase` (by id), "not found" here is an expected, handled case
 * for the caller (Phase 5: `riders`' Excel importer resolving a
 * spreadsheet's "Team Name" column), not an exceptional one.
 */
export class GetTeamByNameUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(name: string): Promise<Team | null> {
    return this.teamRepository.findByName(name);
  }
}
