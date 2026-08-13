import { Rider } from '@modules/riders/domain/entities/rider.entity';
import { RiderRepositoryPort } from '@modules/riders/domain/ports/rider-repository.port';

export class FakeRiderRepository implements RiderRepositoryPort {
  private readonly ridersById = new Map<string, Rider>();

  async findById(id: string): Promise<Rider | null> {
    return this.ridersById.get(id) ?? null;
  }

  async findByName(name: string): Promise<Rider | null> {
    for (const rider of this.ridersById.values()) {
      if (rider.name === name.trim()) return rider;
    }
    return null;
  }

  async save(rider: Rider): Promise<void> {
    this.ridersById.set(rider.id, rider);
  }
}
