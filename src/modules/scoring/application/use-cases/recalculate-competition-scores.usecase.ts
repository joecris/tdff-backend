import { ScoringRepositoryPort } from '../../domain/ports/scoring-repository.port';
import { calculateEntryScore } from '../../domain/services/scoring-calculator';
import { ScoringContextNotFoundError } from '../../domain/errors/scoring.errors';
import { RecalculateLeagueLeaderboardUseCase } from './recalculate-league-leaderboard.usecase';

/**
 * The trigger target for `competitions`' submit-results use case. Recomputes
 * every entry's score for one competition, always from scratch (never
 * incrementing a prior value — `saveEntryScore` is an upsert keyed on
 * `entryId`), then cascades into a full league leaderboard recompute.
 *
 * The rule set scored against is this competition's OWN
 * `context.slotPoints` (Phase 4.5's `competition_slot_configs`), not a
 * global constant — two competitions can score the same slot name at
 * different point values.
 *
 * `resultSelections === null` (no result submitted, or one retracted) is
 * NOT treated as "nothing to do" — every entry is explicitly scored 0 via
 * `calculateEntryScore`'s own null handling. That's what makes a
 * hypothetical future "retract result" action correct for free: it would
 * just need to call this same use case again, no new code path.
 */
export class RecalculateCompetitionScoresUseCase {
  constructor(
    private readonly scoringRepository: ScoringRepositoryPort,
    private readonly recalculateLeaderboardUseCase: RecalculateLeagueLeaderboardUseCase,
  ) {}

  async execute(competitionId: string): Promise<void> {
    const context = await this.scoringRepository.getCompetitionContext(competitionId);
    if (!context) {
      throw new ScoringContextNotFoundError(competitionId);
    }

    const resultSelections = await this.scoringRepository.getResultSelections(competitionId);
    const entries = await this.scoringRepository.listEntriesWithSelections(competitionId);

    for (const entry of entries) {
      const score = calculateEntryScore(entry.selections, resultSelections, context.slotPoints);
      await this.scoringRepository.saveEntryScore(
        entry.entryId,
        competitionId,
        entry.userId,
        score,
      );
    }

    await this.recalculateLeaderboardUseCase.execute(context.fantasyLeagueId);
  }
}
