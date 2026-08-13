import { CompetitionResult } from '../../../../domain/entities/competition-result.entity';

export interface CompetitionResultSelectionResponseDto {
  slot: string;
  grandTourRiderId?: string;
  grandTourTeamId?: string;
}

export interface CompetitionResultResponseDto {
  id: string;
  competitionId: string;
  submittedByUserId?: string;
  selections: CompetitionResultSelectionResponseDto[];
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function toCompetitionResultResponseDto(
  result: CompetitionResult,
): CompetitionResultResponseDto {
  return {
    id: result.id,
    competitionId: result.competitionId,
    ...(result.submittedByUserId !== undefined
      ? { submittedByUserId: result.submittedByUserId }
      : {}),
    selections: result.selections.map((selection) => ({
      slot: selection.slot,
      ...(selection.grandTourRiderId !== undefined
        ? { grandTourRiderId: selection.grandTourRiderId }
        : {}),
      ...(selection.grandTourTeamId !== undefined
        ? { grandTourTeamId: selection.grandTourTeamId }
        : {}),
    })),
    submittedAt: result.submittedAt.toISOString(),
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  };
}
