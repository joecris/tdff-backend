import {
  ScoringRepositoryPort,
  UserScoreSummary,
} from '../../domain/ports/scoring-repository.port';

/**
 * Sums every league member's `competition_entry_scores` across the whole
 * league (0 for a member with no entries, never excluded — see
 * `sumScoresByUser`'s doc comment), ranks, and persists. Ranks are
 * sequential per sorted position (1, 2, 3, ...), not shared on ties —
 * score desc, then earliest entry submission as the tie-break (the plan's
 * "Leaderboard tie-breaking" v1 default). A member with no submission at
 * all sorts after every tied member who has one.
 */
export class RecalculateLeagueLeaderboardUseCase {
  constructor(private readonly scoringRepository: ScoringRepositoryPort) {}

  async execute(fantasyLeagueId: string): Promise<void> {
    const summaries = await this.scoringRepository.sumScoresByUser(fantasyLeagueId);
    const ranked = [...summaries].sort(compareForRanking).map((summary, index) => ({
      userId: summary.userId,
      totalScore: summary.totalScore,
      rank: index + 1,
    }));

    await this.scoringRepository.saveLeaderboard(fantasyLeagueId, ranked);
  }
}

function compareForRanking(a: UserScoreSummary, b: UserScoreSummary): number {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  if (a.earliestSubmittedAt && b.earliestSubmittedAt) {
    return a.earliestSubmittedAt.getTime() - b.earliestSubmittedAt.getTime();
  }
  if (a.earliestSubmittedAt) return -1;
  if (b.earliestSubmittedAt) return 1;
  return 0;
}
