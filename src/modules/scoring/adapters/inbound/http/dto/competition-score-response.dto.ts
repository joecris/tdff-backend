import { CompetitionEntryScore } from '../../../../domain/entities/competition-entry-score.entity';

export interface CompetitionScoreResponseDto {
  entryId: string;
  userId: string;
  score: number;
  calculatedAt: string;
}

export function toCompetitionScoreResponseDto(
  score: CompetitionEntryScore,
): CompetitionScoreResponseDto {
  return {
    entryId: score.entryId,
    userId: score.userId,
    score: score.score,
    calculatedAt: score.calculatedAt.toISOString(),
  };
}
