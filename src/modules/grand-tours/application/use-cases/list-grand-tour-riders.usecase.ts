import { GrandTourRider } from '../../domain/entities/grand-tour-rider.entity';
import { GrandTourRepositoryPort } from '../../domain/ports/grand-tour-repository.port';
import { GrandTourRiderRepositoryPort } from '../../domain/ports/grand-tour-rider-repository.port';
import { GrandTourNotFoundError } from '../../domain/errors/grand-tour.errors';

export class ListGrandTourRidersUseCase {
  constructor(
    private readonly grandTourRiderRepository: GrandTourRiderRepositoryPort,
    private readonly grandTourRepository: GrandTourRepositoryPort,
  ) {}

  async execute(grandTourId: string): Promise<GrandTourRider[]> {
    const grandTour = await this.grandTourRepository.findById(grandTourId);
    if (!grandTour) {
      throw new GrandTourNotFoundError(grandTourId);
    }

    return this.grandTourRiderRepository.listByGrandTour(grandTourId);
  }
}
