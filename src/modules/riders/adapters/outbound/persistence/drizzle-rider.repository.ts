import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Rider } from '../../../domain/entities/rider.entity';
import { RiderRepositoryPort } from '../../../domain/ports/rider-repository.port';
import { ridersTable } from '@infrastructure/db/schema/rider.schema';
import * as schema from '@infrastructure/db/schema';
import { RiderMapper } from './mappers/rider.mapper';

export class DrizzleRiderRepository implements RiderRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<Rider | null> {
    const [row] = await this.db.select().from(ridersTable).where(eq(ridersTable.id, id)).limit(1);
    return row ? RiderMapper.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Rider | null> {
    const [row] = await this.db
      .select()
      .from(ridersTable)
      .where(eq(ridersTable.name, name.trim()))
      .limit(1);
    return row ? RiderMapper.toDomain(row) : null;
  }

  async save(rider: Rider): Promise<void> {
    const row = RiderMapper.toPersistence(rider);
    const { id, createdAt, ...updatableFields } = row;

    await this.db.insert(ridersTable).values(row).onConflictDoUpdate({
      target: ridersTable.id,
      set: updatableFields,
    });
  }
}
