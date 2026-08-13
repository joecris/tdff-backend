import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { GrandTourRepositoryPort } from '@modules/grand-tours/domain/ports/grand-tour-repository.port';

export class FakeGrandTourRepository implements GrandTourRepositoryPort {
  private readonly grandToursById = new Map<string, GrandTour>();

  async findById(id: string): Promise<GrandTour | null> {
    return this.grandToursById.get(id) ?? null;
  }

  async save(grandTour: GrandTour): Promise<void> {
    this.grandToursById.set(grandTour.id, grandTour);
  }
}
