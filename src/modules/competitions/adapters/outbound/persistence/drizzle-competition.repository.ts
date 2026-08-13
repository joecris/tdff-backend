import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Competition } from '../../../domain/entities/competition.entity';
import { CompetitionRepositoryPort } from '../../../domain/ports/competition-repository.port';
import { competitionsTable } from '@infrastructure/db/schema/competition.schema';
import { competitionSlotConfigsTable } from '@infrastructure/db/schema/competition-slot-config.schema';
import * as schema from '@infrastructure/db/schema';
import { CompetitionMapper } from './mappers/competition.mapper';

export class DrizzleCompetitionRepository implements CompetitionRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<Competition | null> {
    const [row] = await this.db
      .select()
      .from(competitionsTable)
      .where(eq(competitionsTable.id, id))
      .limit(1);
    if (!row) return null;

    const slotConfigRows = await this.db
      .select()
      .from(competitionSlotConfigsTable)
      .where(eq(competitionSlotConfigsTable.competitionId, id));

    return CompetitionMapper.toDomain(row, slotConfigRows);
  }

  async save(competition: Competition): Promise<void> {
    await this.db.transaction(async (tx) => {
      const row = CompetitionMapper.toPersistence(competition);
      const { id, createdAt, ...updatableFields } = row;

      await tx.insert(competitionsTable).values(row).onConflictDoUpdate({
        target: competitionsTable.id,
        set: updatableFields,
      });

      // Full-replace, not merge — same pattern as competition entries'
      // selections; slot-config counts are always tiny (a handful of rows).
      await tx
        .delete(competitionSlotConfigsTable)
        .where(eq(competitionSlotConfigsTable.competitionId, competition.id));

      const slotRows = CompetitionMapper.slotsToPersistence(competition);
      if (slotRows.length > 0) {
        await tx.insert(competitionSlotConfigsTable).values(slotRows);
      }
    });
  }
}
