import { GrandTourRider } from '../../domain/entities/grand-tour-rider.entity';
import { GrandTourRiderRepositoryPort } from '../../domain/ports/grand-tour-rider-repository.port';
import { GrandTourRiderNotFoundError } from '../../domain/errors/grand-tour.errors';

/** Rider equivalent of get-grand-tour-team.usecase.ts — same rationale. */
export class GetGrandTourRiderUseCase {
  constructor(private readonly grandTourRiderRepository: GrandTourRiderRepositoryPort) {}

  async execute(id: string): Promise<GrandTourRider> {
    const grandTourRider = await this.grandTourRiderRepository.findById(id);
    if (!grandTourRider) {
      throw new GrandTourRiderNotFoundError(id);
    }
    return grandTourRider;
  }
}
