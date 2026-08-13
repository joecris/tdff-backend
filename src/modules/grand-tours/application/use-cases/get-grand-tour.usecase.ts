import { GrandTour } from '../../domain/entities/grand-tour.entity';
import { GrandTourRepositoryPort } from '../../domain/ports/grand-tour-repository.port';
import { GrandTourNotFoundError } from '../../domain/errors/grand-tour.errors';

export class GetGrandTourUseCase {
  constructor(private readonly grandTourRepository: GrandTourRepositoryPort) {}

  async execute(id: string): Promise<GrandTour> {
    const grandTour = await this.grandTourRepository.findById(id);
    if (!grandTour) {
      throw new GrandTourNotFoundError(id);
    }
    return grandTour;
  }
}
