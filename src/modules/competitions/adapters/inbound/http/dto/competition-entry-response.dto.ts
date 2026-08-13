import { CompetitionEntry } from '../../../../domain/entities/competition-entry.entity';

export interface CompetitionEntrySelectionResponseDto {
  slot: string;
  grandTourRiderId?: string;
  grandTourTeamId?: string;
}

export interface CompetitionEntryResponseDto {
  id: string;
  competitionId: string;
  userId: string;
  selections: CompetitionEntrySelectionResponseDto[];
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function toCompetitionEntryResponseDto(
  entry: CompetitionEntry,
): CompetitionEntryResponseDto {
  return {
    id: entry.id,
    competitionId: entry.competitionId,
    userId: entry.userId,
    selections: entry.selections.map((selection) => ({
      slot: selection.slot,
      ...(selection.grandTourRiderId !== undefined
        ? { grandTourRiderId: selection.grandTourRiderId }
        : {}),
      ...(selection.grandTourTeamId !== undefined
        ? { grandTourTeamId: selection.grandTourTeamId }
        : {}),
    })),
    submittedAt: entry.submittedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}
