import { z } from 'zod';
import { LeagueLeaderboardEntry } from '../../../../domain/entities/league-leaderboard-entry.entity';

export const leaderboardEntryResponseSchema = z.object({
  userId: z.uuid(),
  totalScore: z.number(),
  rank: z.number().int(),
  calculatedAt: z.iso.datetime(),
});
export type LeaderboardEntryResponseDto = z.infer<typeof leaderboardEntryResponseSchema>;

export function toLeaderboardEntryResponseDto(
  entry: LeagueLeaderboardEntry,
): LeaderboardEntryResponseDto {
  return {
    userId: entry.userId,
    totalScore: entry.totalScore,
    rank: entry.rank,
    calculatedAt: entry.calculatedAt.toISOString(),
  };
}
