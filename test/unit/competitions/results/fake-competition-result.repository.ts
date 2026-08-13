import { CompetitionResult } from '@modules/competitions/domain/entities/competition-result.entity';
import { CompetitionResultRepositoryPort } from '@modules/competitions/domain/ports/competition-result-repository.port';

export class FakeCompetitionResultRepository implements CompetitionResultRepositoryPort {
  private readonly resultsByCompetitionId = new Map<string, CompetitionResult>();

  async findByCompetition(competitionId: string): Promise<CompetitionResult | null> {
    return this.resultsByCompetitionId.get(competitionId) ?? null;
  }

  async save(result: CompetitionResult): Promise<void> {
    this.resultsByCompetitionId.set(result.competitionId, result);
  }
}
