import { CompetitionEntry } from '../../../../domain/entities/competition-entry.entity';
import { CompetitionEntrySelection } from '../../../../domain/entities/competition-entry-selection.entity';
import { SelectionSlot } from '@shared/domain/selection-slot';
import {
  CompetitionEntryRow,
  NewCompetitionEntryRow,
} from '@infrastructure/db/schema/competition-entry.schema';
import {
  CompetitionEntrySelectionRow,
  NewCompetitionEntrySelectionRow,
} from '@infrastructure/db/schema/competition-entry-selection.schema';

/**
 * Reconstructs the `CompetitionEntry` aggregate from two row sets (the
 * entry row itself plus its selection rows) — the repository is
 * responsible for fetching both and handing them to `toDomain` together;
 * this mapper only translates shapes, it never queries.
 */
export class CompetitionEntryMapper {
  static toDomain(
    entryRow: CompetitionEntryRow,
    selectionRows: CompetitionEntrySelectionRow[],
  ): CompetitionEntry {
    const selections = selectionRows.map((row) =>
      CompetitionEntrySelection.fromPersistence({
        id: row.id,
        // `slot` is validated against SELECTION_SLOTS at write time (DTO +
        // domain construction); trusted as-is on the way back out.
        slot: row.slot as SelectionSlot,
        ...(row.grandTourRiderId !== null ? { grandTourRiderId: row.grandTourRiderId } : {}),
        ...(row.grandTourTeamId !== null ? { grandTourTeamId: row.grandTourTeamId } : {}),
      }),
    );

    return CompetitionEntry.fromPersistence({
      id: entryRow.id,
      competitionId: entryRow.competitionId,
      userId: entryRow.userId,
      selections,
      submittedAt: entryRow.submittedAt,
      createdAt: entryRow.createdAt,
      updatedAt: entryRow.updatedAt,
    });
  }

  static toPersistence(entry: CompetitionEntry): NewCompetitionEntryRow {
    const props = entry.toJSON();
    return {
      id: props.id,
      competitionId: props.competitionId,
      userId: props.userId,
      submittedAt: props.submittedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  static selectionsToPersistence(entry: CompetitionEntry): NewCompetitionEntrySelectionRow[] {
    return entry.selections.map((selection) => {
      const props = selection.toJSON();
      return {
        id: props.id,
        entryId: entry.id,
        slot: props.slot,
        ...(props.grandTourRiderId !== undefined
          ? { grandTourRiderId: props.grandTourRiderId }
          : {}),
        ...(props.grandTourTeamId !== undefined ? { grandTourTeamId: props.grandTourTeamId } : {}),
      };
    });
  }
}
