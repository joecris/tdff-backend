import { GrandTourRepositoryPort } from '../../domain/ports/grand-tour-repository.port';
import { PaginatedResult, PaginationParams, toPaginatedResult } from '@shared/domain/pagination';
import { GrandTour } from '../../domain/entities/grand-tour.entity';

export class ListGrandToursUseCase {
  constructor(private readonly grandTourRepository: GrandTourRepositoryPort) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<GrandTour>> {
    const { items, total } = await this.grandTourRepository.findMany(params);
    return toPaginatedResult(items, total, params);
  }
}
