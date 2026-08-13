import { Rider } from '../../domain/entities/rider.entity';
import { RiderRepositoryPort } from '../../domain/ports/rider-repository.port';
import { RiderNotFoundError } from '../../domain/errors/rider.errors';

export class GetRiderUseCase {
  constructor(private readonly riderRepository: RiderRepositoryPort) {}

  async execute(id: string): Promise<Rider> {
    const rider = await this.riderRepository.findById(id);
    if (!rider) {
      throw new RiderNotFoundError(id);
    }
    return rider;
  }
}
