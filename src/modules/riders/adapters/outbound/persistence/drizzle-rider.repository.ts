import { count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Rider } from '../../../domain/entities/rider.entity';
import { RiderRepositoryPort } from '../../../domain/ports/rider-repository.port';
import { ridersTable } from '@infrastructure/db/schema/rider.schema';
import * as schema from '@infrastructure/db/schema';
import { PaginationParams } from '@shared/domain/pagination';
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

  async findMany(params: PaginationParams): Promise<{ items: Rider[]; total: number }> {
    const offset = (params.page - 1) * params.limit;
    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(ridersTable)
        .orderBy(desc(ridersTable.createdAt))
        .limit(params.limit)
        .offset(offset),
      this.db.select({ value: count() }).from(ridersTable),
    ]);

    return { items: rows.map(RiderMapper.toDomain), total: totalRow?.value ?? 0 };
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
