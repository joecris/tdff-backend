import { and, eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CompetitionEntry } from '../../../domain/entities/competition-entry.entity';
import { CompetitionEntryRepositoryPort } from '../../../domain/ports/competition-entry-repository.port';
import { competitionEntriesTable } from '@infrastructure/db/schema/competition-entry.schema';
import {
  competitionEntrySelectionsTable,
  CompetitionEntrySelectionRow,
} from '@infrastructure/db/schema/competition-entry-selection.schema';
import * as schema from '@infrastructure/db/schema';
import { CompetitionEntryMapper } from './mappers/competition-entry.mapper';

export class DrizzleCompetitionEntryRepository implements CompetitionEntryRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findByCompetitionAndUser(
    competitionId: string,
    userId: string,
  ): Promise<CompetitionEntry | null> {
    const [entryRow] = await this.db
      .select()
      .from(competitionEntriesTable)
      .where(
        and(
          eq(competitionEntriesTable.competitionId, competitionId),
          eq(competitionEntriesTable.userId, userId),
        ),
      )
      .limit(1);

    if (!entryRow) return null;

    const selectionRows = await this.selectionsForEntry(entryRow.id);
    return CompetitionEntryMapper.toDomain(entryRow, selectionRows);
  }

  async listByCompetition(competitionId: string): Promise<CompetitionEntry[]> {
    const entryRows = await this.db
      .select()
      .from(competitionEntriesTable)
      .where(eq(competitionEntriesTable.competitionId, competitionId));

    if (entryRows.length === 0) return [];

    const entryIds = entryRows.map((row) => row.id);
    const selectionRows = await this.db
      .select()
      .from(competitionEntrySelectionsTable)
      .where(inArray(competitionEntrySelectionsTable.entryId, entryIds));

    const selectionsByEntryId = new Map<string, CompetitionEntrySelectionRow[]>();
    for (const row of selectionRows) {
      const bucket = selectionsByEntryId.get(row.entryId) ?? [];
      bucket.push(row);
      selectionsByEntryId.set(row.entryId, bucket);
    }

    return entryRows.map((entryRow) =>
      CompetitionEntryMapper.toDomain(entryRow, selectionsByEntryId.get(entryRow.id) ?? []),
    );
  }

  async save(entry: CompetitionEntry): Promise<void> {
    await this.db.transaction(async (tx) => {
      const entryRow = CompetitionEntryMapper.toPersistence(entry);
      const { id, createdAt, ...updatableEntryFields } = entryRow;

      await tx.insert(competitionEntriesTable).values(entryRow).onConflictDoUpdate({
        target: competitionEntriesTable.id,
        set: updatableEntryFields,
      });

      // Full-replace, not merge — simplest correct approach given selection
      // counts are always tiny (1-8 rows per entry per competition-slot-rules.ts).
      await tx
        .delete(competitionEntrySelectionsTable)
        .where(eq(competitionEntrySelectionsTable.entryId, entry.id));

      const selectionRows = CompetitionEntryMapper.selectionsToPersistence(entry);
      if (selectionRows.length > 0) {
        await tx.insert(competitionEntrySelectionsTable).values(selectionRows);
      }
    });
  }

  private async selectionsForEntry(entryId: string): Promise<CompetitionEntrySelectionRow[]> {
    return this.db
      .select()
      .from(competitionEntrySelectionsTable)
      .where(eq(competitionEntrySelectionsTable.entryId, entryId));
  }
}
