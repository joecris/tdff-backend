import { TeamRepositoryPort } from '../../domain/ports/team-repository.port';
import { PaginatedResult, PaginationParams, toPaginatedResult } from '@shared/domain/pagination';
import { Team } from '../../domain/entities/team.entity';

export class ListTeamsUseCase {
  constructor(private readonly teamRepository: TeamRepositoryPort) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<Team>> {
    const { items, total } = await this.teamRepository.findMany(params);
    return toPaginatedResult(items, total, params);
  }
}
