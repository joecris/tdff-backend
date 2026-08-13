import { CompetitionEntryScore } from '../domain/entities/competition-entry-score.entity';
import { LeagueLeaderboardEntry } from '../domain/entities/league-leaderboard-entry.entity';
import { ScoringRepositoryPort } from '../domain/ports/scoring-repository.port';
import { ScoringServicePort } from '../domain/ports/scoring-service.port';
import { RecalculateCompetitionScoresUseCase } from './use-cases/recalculate-competition-scores.usecase';
import { RecalculateLeagueLeaderboardUseCase } from './use-cases/recalculate-league-leaderboard.usecase';
import { GetLeaderboardUseCase } from './use-cases/get-leaderboard.usecase';
import { ListCompetitionScoresUseCase } from './use-cases/list-competition-scores.usecase';

export class ScoringService implements ScoringServicePort {
  private readonly recalculateCompetitionScoresUseCase: RecalculateCompetitionScoresUseCase;
  private readonly getLeaderboardUseCase: GetLeaderboardUseCase;
  private readonly listCompetitionScoresUseCase: ListCompetitionScoresUseCase;

  // No longer takes an injected `ruleSet` (Phase 4.5) — each competition's
  // points are read per-recalculation from its own `slotPoints`, sourced
  // from `competition_slot_configs` via `ScoringRepositoryPort.getCompetitionContext`.
  constructor(scoringRepository: ScoringRepositoryPort) {
    const recalculateLeaderboardUseCase = new RecalculateLeagueLeaderboardUseCase(
      scoringRepository,
    );
    this.recalculateCompetitionScoresUseCase = new RecalculateCompetitionScoresUseCase(
      scoringRepository,
      recalculateLeaderboardUseCase,
    );
    this.getLeaderboardUseCase = new GetLeaderboardUseCase(scoringRepository);
    this.listCompetitionScoresUseCase = new ListCompetitionScoresUseCase(scoringRepository);
  }

  recalculateCompetitionScores(competitionId: string): Promise<void> {
    return this.recalculateCompetitionScoresUseCase.execute(competitionId);
  }

  getLeaderboard(fantasyLeagueId: string): Promise<LeagueLeaderboardEntry[]> {
    return this.getLeaderboardUseCase.execute(fantasyLeagueId);
  }

  listScoresByCompetition(competitionId: string): Promise<CompetitionEntryScore[]> {
    return this.listCompetitionScoresUseCase.execute(competitionId);
  }
}
