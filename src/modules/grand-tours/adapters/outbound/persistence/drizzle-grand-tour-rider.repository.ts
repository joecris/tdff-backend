import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { GrandTourRider } from '../../../domain/entities/grand-tour-rider.entity';
import { GrandTourRiderRepositoryPort } from '../../../domain/ports/grand-tour-rider-repository.port';
import { grandTourRidersTable } from '@infrastructure/db/schema/grand-tour-rider.schema';
import * as schema from '@infrastructure/db/schema';
import { GrandTourRiderMapper } from './mappers/grand-tour-rider.mapper';

export class DrizzleGrandTourRiderRepository implements GrandTourRiderRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<GrandTourRider | null> {
    const [row] = await this.db
      .select()
      .from(grandTourRidersTable)
      .where(eq(grandTourRidersTable.id, id))
      .limit(1);
    return row ? GrandTourRiderMapper.toDomain(row) : null;
  }

  async findByGrandTourAndRider(
    grandTourId: string,
    riderId: string,
  ): Promise<GrandTourRider | null> {
    const [row] = await this.db
      .select()
      .from(grandTourRidersTable)
      .where(
        and(
          eq(grandTourRidersTable.grandTourId, grandTourId),
          eq(grandTourRidersTable.riderId, riderId),
        ),
      )
      .limit(1);

    return row ? GrandTourRiderMapper.toDomain(row) : null;
  }

  async listByGrandTour(grandTourId: string): Promise<GrandTourRider[]> {
    const rows = await this.db
      .select()
      .from(grandTourRidersTable)
      .where(eq(grandTourRidersTable.grandTourId, grandTourId));

    return rows.map(GrandTourRiderMapper.toDomain);
  }

  async save(grandTourRider: GrandTourRider): Promise<void> {
    const row = GrandTourRiderMapper.toPersistence(grandTourRider);
    const { id, createdAt, ...updatableFields } = row;

    await this.db.insert(grandTourRidersTable).values(row).onConflictDoUpdate({
      target: grandTourRidersTable.id,
      set: updatableFields,
    });
  }
}
