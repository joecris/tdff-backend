import { randomUUID } from 'node:crypto';
import { GrandTourRider } from '../../domain/entities/grand-tour-rider.entity';
import { GrandTourRepositoryPort } from '../../domain/ports/grand-tour-repository.port';
import { GrandTourRiderRepositoryPort } from '../../domain/ports/grand-tour-rider-repository.port';
import { AddRiderToGrandTourInput } from '../../domain/ports/grand-tour-participation-service.port';
import {
  GrandTourNotFoundError,
  RiderAlreadyInGrandTourError,
} from '../../domain/errors/grand-tour.errors';
import { RiderServicePort } from '@modules/riders/domain/ports/rider-service.port';

export class AddRiderToGrandTourUseCase {
  constructor(
    private readonly grandTourRiderRepository: GrandTourRiderRepositoryPort,
    private readonly grandTourRepository: GrandTourRepositoryPort,
    private readonly riderService: RiderServicePort,
  ) {}

  async execute(input: AddRiderToGrandTourInput): Promise<GrandTourRider> {
    const grandTour = await this.grandTourRepository.findById(input.grandTourId);
    if (!grandTour) {
      throw new GrandTourNotFoundError(input.grandTourId);
    }

    await this.riderService.getRiderById(input.riderId);

    const existing = await this.grandTourRiderRepository.findByGrandTourAndRider(
      input.grandTourId,
      input.riderId,
    );
    if (existing) {
      throw new RiderAlreadyInGrandTourError(input.grandTourId, input.riderId);
    }

    const grandTourRider = GrandTourRider.create({
      id: randomUUID(),
      grandTourId: input.grandTourId,
      riderId: input.riderId,
    });

    await this.grandTourRiderRepository.save(grandTourRider);
    return grandTourRider;
  }
}
