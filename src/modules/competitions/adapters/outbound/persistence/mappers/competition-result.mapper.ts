import { CompetitionResult } from '../../../../domain/entities/competition-result.entity';
import { CompetitionResultSelection } from '../../../../domain/entities/competition-result-selection.entity';
import { SelectionSlot } from '@shared/domain/selection-slot';
import {
  CompetitionResultRow,
  NewCompetitionResultRow,
} from '@infrastructure/db/schema/competition-result.schema';
import {
  CompetitionResultSelectionRow,
  NewCompetitionResultSelectionRow,
} from '@infrastructure/db/schema/competition-result-selection.schema';

/** Structural twin of competition-entry.mapper.ts. */
export class CompetitionResultMapper {
  static toDomain(
    resultRow: CompetitionResultRow,
    selectionRows: CompetitionResultSelectionRow[],
  ): CompetitionResult {
    const selections = selectionRows.map((row) =>
      CompetitionResultSelection.fromPersistence({
        id: row.id,
        slot: row.slot as SelectionSlot,
        ...(row.grandTourRiderId !== null ? { grandTourRiderId: row.grandTourRiderId } : {}),
        ...(row.grandTourTeamId !== null ? { grandTourTeamId: row.grandTourTeamId } : {}),
      }),
    );

    return CompetitionResult.fromPersistence({
      id: resultRow.id,
      competitionId: resultRow.competitionId,
      ...(resultRow.submittedByUserId !== null
        ? { submittedByUserId: resultRow.submittedByUserId }
        : {}),
      selections,
      submittedAt: resultRow.submittedAt,
      createdAt: resultRow.createdAt,
      updatedAt: resultRow.updatedAt,
    });
  }

  static toPersistence(result: CompetitionResult): NewCompetitionResultRow {
    const props = result.toJSON();
    return {
      id: props.id,
      competitionId: props.competitionId,
      ...(props.submittedByUserId !== undefined
        ? { submittedByUserId: props.submittedByUserId }
        : {}),
      submittedAt: props.submittedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  static selectionsToPersistence(result: CompetitionResult): NewCompetitionResultSelectionRow[] {
    return result.selections.map((selection) => {
      const props = selection.toJSON();
      return {
        id: props.id,
        resultId: result.id,
        slot: props.slot,
        ...(props.grandTourRiderId !== undefined
          ? { grandTourRiderId: props.grandTourRiderId }
          : {}),
        ...(props.grandTourTeamId !== undefined ? { grandTourTeamId: props.grandTourTeamId } : {}),
      };
    });
  }
}
