import { LeagueLeaderboardEntry } from '../../../../domain/entities/league-leaderboard-entry.entity';
import { LeagueLeaderboardEntryRow } from '@infrastructure/db/schema/league-leaderboard-entry.schema';

export class LeagueLeaderboardEntryMapper {
  static toDomain(row: LeagueLeaderboardEntryRow): LeagueLeaderboardEntry {
    return LeagueLeaderboardEntry.fromPersistence({
      id: row.id,
      fantasyLeagueId: row.fantasyLeagueId,
      userId: row.userId,
      totalScore: row.totalScore,
      rank: row.rank,
      calculatedAt: row.calculatedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
