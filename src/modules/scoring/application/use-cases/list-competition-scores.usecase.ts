import { CompetitionEntryScore } from '../../domain/entities/competition-entry-score.entity';
import { ScoringRepositoryPort } from '../../domain/ports/scoring-repository.port';

export class ListCompetitionScoresUseCase {
  constructor(private readonly scoringRepository: ScoringRepositoryPort) {}

  execute(competitionId: string): Promise<CompetitionEntryScore[]> {
    return this.scoringRepository.listScoresByCompetition(competitionId);
  }
}
