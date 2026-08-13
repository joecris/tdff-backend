import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CompetitionResult } from '../../../domain/entities/competition-result.entity';
import { CompetitionResultRepositoryPort } from '../../../domain/ports/competition-result-repository.port';
import { competitionResultsTable } from '@infrastructure/db/schema/competition-result.schema';
import { competitionResultSelectionsTable } from '@infrastructure/db/schema/competition-result-selection.schema';
import * as schema from '@infrastructure/db/schema';
import { CompetitionResultMapper } from './mappers/competition-result.mapper';

export class DrizzleCompetitionResultRepository implements CompetitionResultRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findByCompetition(competitionId: string): Promise<CompetitionResult | null> {
    const [resultRow] = await this.db
      .select()
      .from(competitionResultsTable)
      .where(eq(competitionResultsTable.competitionId, competitionId))
      .limit(1);

    if (!resultRow) return null;

    const selectionRows = await this.db
      .select()
      .from(competitionResultSelectionsTable)
      .where(eq(competitionResultSelectionsTable.resultId, resultRow.id));

    return CompetitionResultMapper.toDomain(resultRow, selectionRows);
  }

  async save(result: CompetitionResult): Promise<void> {
    await this.db.transaction(async (tx) => {
      const resultRow = CompetitionResultMapper.toPersistence(result);
      const { id, createdAt, ...updatableResultFields } = resultRow;

      await tx.insert(competitionResultsTable).values(resultRow).onConflictDoUpdate({
        target: competitionResultsTable.id,
        set: updatableResultFields,
      });

      // Full-replace, not merge — same reasoning as competition_entry_selections.
      await tx
        .delete(competitionResultSelectionsTable)
        .where(eq(competitionResultSelectionsTable.resultId, result.id));

      const selectionRows = CompetitionResultMapper.selectionsToPersistence(result);
      if (selectionRows.length > 0) {
        await tx.insert(competitionResultSelectionsTable).values(selectionRows);
      }
    });
  }
}
