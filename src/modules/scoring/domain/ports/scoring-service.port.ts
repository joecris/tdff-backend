import { CompetitionEntryScore } from '../entities/competition-entry-score.entity';
import { LeagueLeaderboardEntry } from '../entities/league-leaderboard-entry.entity';

export interface ScoringServicePort {
  /** Triggered by `competitions`' submit-results use case after persisting
   * a result (or its correction) — recomputes every entry's score for the
   * competition, then the whole league's leaderboard. */
  recalculateCompetitionScores(competitionId: string): Promise<void>;
  getLeaderboard(fantasyLeagueId: string): Promise<LeagueLeaderboardEntry[]>;
  listScoresByCompetition(competitionId: string): Promise<CompetitionEntryScore[]>;
}
