import { CompetitionRepositoryPort } from '../../domain/ports/competition-repository.port';
import { PaginatedResult, PaginationParams, toPaginatedResult } from '@shared/domain/pagination';
import { Competition } from '../../domain/entities/competition.entity';

export class ListCompetitionsUseCase {
  constructor(private readonly competitionRepository: CompetitionRepositoryPort) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<Competition>> {
    const { items, total } = await this.competitionRepository.findMany(params);
    return toPaginatedResult(items, total, params);
  }
}
