import { z } from 'zod';
import { CompetitionEntryScore } from '../../../../domain/entities/competition-entry-score.entity';

export const competitionScoreResponseSchema = z.object({
  entryId: z.uuid(),
  userId: z.uuid(),
  score: z.number(),
  calculatedAt: z.iso.datetime(),
});
export type CompetitionScoreResponseDto = z.infer<typeof competitionScoreResponseSchema>;

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
