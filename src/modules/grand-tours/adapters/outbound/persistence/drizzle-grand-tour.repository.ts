import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { GrandTour } from '../../../domain/entities/grand-tour.entity';
import { GrandTourRepositoryPort } from '../../../domain/ports/grand-tour-repository.port';
import { grandToursTable } from '@infrastructure/db/schema/grand-tour.schema';
import * as schema from '@infrastructure/db/schema';
import { GrandTourMapper } from './mappers/grand-tour.mapper';

/**
 * Outbound adapter implementing GrandTourRepositoryPort with Drizzle/Postgres.
 * `db` is injected (see infrastructure/config/di-container.ts) rather than
 * imported directly, so this class can be unit tested against any
 * drizzle-orm instance (e.g. one pointed at a test DB or in-memory pg-mem).
 */
export class DrizzleGrandTourRepository implements GrandTourRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<GrandTour | null> {
    const [row] = await this.db
      .select()
      .from(grandToursTable)
      .where(eq(grandToursTable.id, id))
      .limit(1);

    return row ? GrandTourMapper.toDomain(row) : null;
  }

  async save(grandTour: GrandTour): Promise<void> {
    const row = GrandTourMapper.toPersistence(grandTour);
    // Never overwrite the primary key or the original creation timestamp;
    // everything else flows through as-is, present-or-absent, whatever
    // `toPersistence` produced — no need to hardcode each column by name.
    const { id, createdAt, ...updatableFields } = row;

    await this.db.insert(grandToursTable).values(row).onConflictDoUpdate({
      target: grandToursTable.id,
      set: updatableFields,
    });
  }
}
