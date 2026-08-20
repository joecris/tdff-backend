import { count, desc, eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Competition } from '../../../domain/entities/competition.entity';
import { CompetitionRepositoryPort } from '../../../domain/ports/competition-repository.port';
import { competitionsTable } from '@infrastructure/db/schema/competition.schema';
import {
  competitionSlotConfigsTable,
  CompetitionSlotConfigRow,
} from '@infrastructure/db/schema/competition-slot-config.schema';
import * as schema from '@infrastructure/db/schema';
import { PaginationParams } from '@shared/domain/pagination';
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

  async findMany(params: PaginationParams): Promise<{ items: Competition[]; total: number }> {
    const offset = (params.page - 1) * params.limit;
    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(competitionsTable)
        .orderBy(desc(competitionsTable.createdAt))
        .limit(params.limit)
        .offset(offset),
      this.db.select({ value: count() }).from(competitionsTable),
    ]);

    if (rows.length === 0) {
      return { items: [], total: totalRow?.value ?? 0 };
    }

    // Batch-fetch every row's slot configs in one query rather than N+1 —
    // same reasoning `competition_entry_scores`' denormalized columns
    // avoid a join on the hot read path, just for a different query shape.
    const slotConfigRows = await this.db
      .select()
      .from(competitionSlotConfigsTable)
      .where(
        inArray(
          competitionSlotConfigsTable.competitionId,
          rows.map((r) => r.id),
        ),
      );

    const slotsByCompetitionId = new Map<string, CompetitionSlotConfigRow[]>();
    for (const slotRow of slotConfigRows) {
      const existing = slotsByCompetitionId.get(slotRow.competitionId);
      if (existing) {
        existing.push(slotRow);
      } else {
        slotsByCompetitionId.set(slotRow.competitionId, [slotRow]);
      }
    }

    const items = rows.map((row) =>
      CompetitionMapper.toDomain(row, slotsByCompetitionId.get(row.id) ?? []),
    );
    return { items, total: totalRow?.value ?? 0 };
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
