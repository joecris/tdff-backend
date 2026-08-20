import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { GrandTourRepositoryPort } from '@modules/grand-tours/domain/ports/grand-tour-repository.port';
import { PaginationParams } from '@shared/domain/pagination';
import { paginateFake } from '../shared/paginate-fake';

export class FakeGrandTourRepository implements GrandTourRepositoryPort {
  private readonly grandToursById = new Map<string, GrandTour>();

  async findById(id: string): Promise<GrandTour | null> {
    return this.grandToursById.get(id) ?? null;
  }

  async findMany(params: PaginationParams): Promise<{ items: GrandTour[]; total: number }> {
    return paginateFake([...this.grandToursById.values()], params, (g) => g.createdAt);
  }

  async save(grandTour: GrandTour): Promise<void> {
    this.grandToursById.set(grandTour.id, grandTour);
  }
}
