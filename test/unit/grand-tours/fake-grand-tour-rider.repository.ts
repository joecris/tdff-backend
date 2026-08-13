import { GrandTourRider } from '@modules/grand-tours/domain/entities/grand-tour-rider.entity';
import { GrandTourRiderRepositoryPort } from '@modules/grand-tours/domain/ports/grand-tour-rider-repository.port';

export class FakeGrandTourRiderRepository implements GrandTourRiderRepositoryPort {
  private readonly rows: GrandTourRider[] = [];

  async findById(id: string): Promise<GrandTourRider | null> {
    return this.rows.find((r) => r.id === id) ?? null;
  }

  async findByGrandTourAndRider(
    grandTourId: string,
    riderId: string,
  ): Promise<GrandTourRider | null> {
    return this.rows.find((r) => r.grandTourId === grandTourId && r.riderId === riderId) ?? null;
  }

  async listByGrandTour(grandTourId: string): Promise<GrandTourRider[]> {
    return this.rows.filter((r) => r.grandTourId === grandTourId);
  }

  async save(grandTourRider: GrandTourRider): Promise<void> {
    this.rows.push(grandTourRider);
  }
}
