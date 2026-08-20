import { FantasyLeagueRepositoryPort } from '../../domain/ports/fantasy-league-repository.port';
import { PaginatedResult, PaginationParams, toPaginatedResult } from '@shared/domain/pagination';
import { FantasyLeague } from '../../domain/entities/fantasy-league.entity';

export class ListFantasyLeaguesUseCase {
  constructor(private readonly fantasyLeagueRepository: FantasyLeagueRepositoryPort) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<FantasyLeague>> {
    const { items, total } = await this.fantasyLeagueRepository.findMany(params);
    return toPaginatedResult(items, total, params);
  }
}
