import { RiderRepositoryPort } from '../../domain/ports/rider-repository.port';
import { PaginatedResult, PaginationParams, toPaginatedResult } from '@shared/domain/pagination';
import { Rider } from '../../domain/entities/rider.entity';

export class ListRidersUseCase {
  constructor(private readonly riderRepository: RiderRepositoryPort) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<Rider>> {
    const { items, total } = await this.riderRepository.findMany(params);
    return toPaginatedResult(items, total, params);
  }
}
