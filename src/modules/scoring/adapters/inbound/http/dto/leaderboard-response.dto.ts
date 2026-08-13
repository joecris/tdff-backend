import { LeagueLeaderboardEntry } from '../../../../domain/entities/league-leaderboard-entry.entity';

export interface LeaderboardEntryResponseDto {
  userId: string;
  totalScore: number;
  rank: number;
  calculatedAt: string;
}

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
