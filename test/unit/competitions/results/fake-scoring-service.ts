import { ScoringServicePort } from '@modules/scoring/domain/ports/scoring-service.port';
import { CompetitionEntryScore } from '@modules/scoring/domain/entities/competition-entry-score.entity';
import { LeagueLeaderboardEntry } from '@modules/scoring/domain/entities/league-leaderboard-entry.entity';

/**
 * Spy, not a real implementation — `submit-competition-results.usecase.test.ts`
 * only needs to confirm `recalculateCompetitionScores` was actually called
 * (and with which competitionId) after a result is persisted; the
 * recalculation logic itself is scoring's own concern, tested in
 * test/unit/scoring/.
 */
export class FakeScoringService implements ScoringServicePort {
  readonly recalculateCalls: string[] = [];

  async recalculateCompetitionScores(competitionId: string): Promise<void> {
    this.recalculateCalls.push(competitionId);
  }

  async getLeaderboard(_fantasyLeagueId: string): Promise<LeagueLeaderboardEntry[]> {
    return [];
  }

  async listScoresByCompetition(_competitionId: string): Promise<CompetitionEntryScore[]> {
    return [];
  }
}
