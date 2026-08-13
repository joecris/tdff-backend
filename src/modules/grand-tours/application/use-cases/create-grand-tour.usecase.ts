import { randomUUID } from 'node:crypto';
import { GrandTour } from '../../domain/entities/grand-tour.entity';
import { GrandTourRepositoryPort } from '../../domain/ports/grand-tour-repository.port';
import { CreateGrandTourInput } from '../../domain/ports/grand-tour-service.port';

/**
 * Use cases are plain classes/functions depending only on ports (interfaces).
 * No Express, no Drizzle — trivially unit-testable with a fake repository.
 */
export class CreateGrandTourUseCase {
  constructor(private readonly grandTourRepository: GrandTourRepositoryPort) {}

  async execute(input: CreateGrandTourInput): Promise<GrandTour> {
    const grandTour = GrandTour.create({
      id: randomUUID(),
      name: input.name,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
    });

    await this.grandTourRepository.save(grandTour);
    return grandTour;
  }
}
