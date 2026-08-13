import { LeagueLeaderboardEntry } from '../../domain/entities/league-leaderboard-entry.entity';
import { ScoringRepositoryPort } from '../../domain/ports/scoring-repository.port';

export class GetLeaderboardUseCase {
  constructor(private readonly scoringRepository: ScoringRepositoryPort) {}

  execute(fantasyLeagueId: string): Promise<LeagueLeaderboardEntry[]> {
    return this.scoringRepository.getLeaderboard(fantasyLeagueId);
  }
}
